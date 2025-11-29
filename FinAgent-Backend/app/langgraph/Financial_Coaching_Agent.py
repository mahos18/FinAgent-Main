"""
Financial Coach AI Agent v2 (Advisor + Proactive Nudger)

- Reads DATABASE_URL & GOOGLE_API_KEY from .env
- Fetches user_profile and transactions from Neon
- Uses LangGraph + Gemini for financial coaching
- Supports two modes via AGENT_MODE env var:
    - advisor : interactive CLI coach (Level 1)
    - nudger  : proactive alert run (Level 2)
"""

from typing import TypedDict, Annotated, List, Dict
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
import operator
import json
import os
from datetime import datetime, timedelta

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

# ========= LOAD ENV (.env + system env) ========= #

load_dotenv()

# ========= POSTGRES (NEON) HELPERS ========= #

def get_db_connection():
    """
    Create a PostgreSQL connection using Neon DATABASE_URL.
    """
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        raise RuntimeError("DATABASE_URL env var not set.")

    conn = psycopg2.connect(db_url)
    return conn


def get_user_profile_from_db(user_id: int) -> Dict:
    """
    Fetch user profile from Neon Postgres in a schema-tolerant way.

    SELECT * FROM users WHERE id = %s LIMIT 1;

    Returns at least:
      - id
      - name (fallback "User")
      - type (fallback "user")
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM users WHERE id = %s LIMIT 1;", (user_id,))
            row = cur.fetchone()

            if not row:
                return {"id": user_id, "name": "Unknown User", "type": "user"}

            profile = dict(row)
            profile["name"] = profile.get("name") or "User"
            profile["type"] = profile.get("type") or "user"
            return profile
    finally:
        conn.close()


def get_transactions_from_db(user_id: int, days: int = 30) -> List[Dict]:
    """
    Fetch categorized transactions from Neon Postgres for the last `days` days.

    Expected minimal schema for `transactions`:
      id | amount | type | date | source | user_id | merchant | category
    """
    conn = get_db_connection()
    try:
        cutoff = datetime.utcnow() - timedelta(days=days)
        print(f"[DEBUG] Fetching transactions for user_id={user_id}, last {days} days (cutoff={cutoff})")

        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, amount, type, date, source, user_id, merchant, category
                FROM transactions
                WHERE user_id = %s
                  AND date >= %s
                ORDER BY date DESC;
                """,
                (user_id, cutoff),
            )

            rows = cur.fetchall()
            print(f"[DEBUG] Found {len(rows)} transactions in DB")

            txns: List[Dict] = []
            for r in rows:
                txns.append(
                    {
                        "id": r["id"],
                        "amount": float(r["amount"]) if r["amount"] is not None else 0.0,
                        "type": r.get("type"),  # 'income' or 'expense'
                        "category": r.get("category") or "Other",
                        "merchant": r.get("merchant"),
                        "date": r["date"].isoformat() if isinstance(r["date"], datetime) else str(r["date"]),
                        "source": r.get("source"),
                    }
                )
            return txns
    finally:
        conn.close()


# ========= LANGGRAPH AGENT ========= #

class AgentState(TypedDict):
    user_profile: Dict
    transactions: List[Dict]
    spending_analysis: Dict
    insights: List[str]
    recommendations: List[str]
    budget_plan: Dict
    messages: Annotated[List, operator.add]
    final_coaching: str


class FinancialCoachAgent:
    def __init__(self, api_key: str, model: str = "gemini-2.5-flash"):
        """
        Initialize the Financial Coach Agent
        """
        self.llm = ChatGoogleGenerativeAI(
            google_api_key=api_key,
            model=model,
            temperature=0.7,
        )
        self.graph = self._build_graph()

    # ---------- Graph definition ---------- #

    def _build_graph(self):
        workflow = StateGraph(AgentState)

        workflow.add_node("analyze_spending", self.analyze_spending)
        workflow.add_node("generate_insights", self.generate_insights)
        workflow.add_node("create_recommendations", self.create_recommendations)
        workflow.add_node("build_budget", self.build_budget)
        workflow.add_node("generate_coaching", self.generate_coaching)

        workflow.set_entry_point("analyze_spending")
        workflow.add_edge("analyze_spending", "generate_insights")
        workflow.add_edge("generate_insights", "create_recommendations")
        workflow.add_edge("create_recommendations", "build_budget")
        workflow.add_edge("build_budget", "generate_coaching")
        workflow.add_edge("generate_coaching", END)

        return workflow.compile()

    # ---------- Node: Analyze Spending ---------- #

    def analyze_spending(self, state: AgentState) -> AgentState:
        """
        Analyze spending patterns from transactions and compute:
        - total_spent
        - total_income
        - savings_rate
        - category_totals
        - category_percentages
        - transaction_count
        """
        transactions = state["transactions"]

        category_totals: Dict[str, float] = {}
        total_spent = 0.0
        total_income = 0.0

        for txn in transactions:
            amount = float(txn.get("amount", 0.0))
            ttype = txn.get("type")
            category = txn.get("category", "Other")

            if ttype == "expense":
                total_spent += abs(amount)
                category_totals[category] = category_totals.get(category, 0.0) + abs(amount)
            elif ttype == "income":
                total_income += amount

        category_percentages = {
            cat: (amt / total_spent * 100) if total_spent > 0 else 0.0
            for cat, amt in category_totals.items()
        }

        savings_rate = ((total_income - total_spent) / total_income * 100) if total_income > 0 else 0.0

        analysis = {
            "total_spent": total_spent,
            "total_income": total_income,
            "savings_rate": savings_rate,
            "category_totals": category_totals,
            "category_percentages": category_percentages,
            "transaction_count": len(transactions),
        }

        state["spending_analysis"] = analysis
        return state

    # ---------- Node: Generate Insights ---------- #

    def generate_insights(self, state: AgentState) -> AgentState:
        analysis = state["spending_analysis"]
        profile = state["user_profile"]
        profile_type = profile.get("type", "user")

        prompt = f"""
You are a financial coach analyzing spending patterns for a {profile_type}.

Spending Summary:
- Total Income: ${analysis['total_income']:.2f}
- Total Spent: ${analysis['total_spent']:.2f}
- Savings Rate: {analysis['savings_rate']:.1f}%
- Number of Transactions: {analysis['transaction_count']}

Category Breakdown:
{json.dumps(analysis['category_totals'], indent=2)}

Provide 3-5 key insights about their spending behavior. Focus on:
1. Spending patterns and trends
2. Areas of concern or overspending
3. Positive habits to acknowledge
4. Comparison to typical {profile_type} spending

Return insights as a JSON array of strings.
"""
        response = self.llm.invoke([HumanMessage(content=prompt)])

        try:
            insights = json.loads(response.content)
        except Exception:
            insights = [response.content]

        state["insights"] = insights
        return state

    # ---------- Node: Create Recommendations ---------- #

    def create_recommendations(self, state: AgentState) -> AgentState:
        analysis = state["spending_analysis"]
        profile = state["user_profile"]
        insights = state["insights"]

        prompt = f"""
You are a financial coach creating actionable recommendations for a {profile.get('type', 'user')}.

Based on these insights:
{json.dumps(insights, indent=2)}

And this spending data:
- Total Income: ${analysis['total_income']:.2f}
- Total Spent: ${analysis['total_spent']:.2f}
- Savings Rate: {analysis['savings_rate']:.1f}%

Create 4-6 specific, actionable recommendations that:
1. Address identified spending issues
2. Are realistic for a {profile.get('type', 'user')}
3. Include concrete action steps
4. Build positive financial habits

Return recommendations as a JSON array of strings. Each recommendation should be 1-2 sentences.
"""
        response = self.llm.invoke([HumanMessage(content=prompt)])

        try:
            recommendations = json.loads(response.content)
        except Exception:
            recommendations = [response.content]

        state["recommendations"] = recommendations
        return state

    # ---------- Node: Build Budget Plan ---------- #

    def build_budget(self, state: AgentState) -> AgentState:
        analysis = state["spending_analysis"]
        profile = state["user_profile"]

        prompt = f"""
You are a financial coach creating a monthly budget plan for a {profile.get('type', 'user')}.

Current Financial Situation:
- Monthly Income: ${analysis['total_income']:.2f}
- Current Spending: ${analysis['total_spent']:.2f}
- Current Savings Rate: {analysis['savings_rate']:.1f}%

Current Spending by Category:
{json.dumps(analysis['category_totals'], indent=2)}

Create a recommended monthly budget with:
1. Suggested amounts for each spending category
2. A target savings percentage (aim for improvement)
3. One "financial goal" they should work towards

Return as JSON with this structure:
{{
  "categories": {{"category_name": amount, ...}},
  "target_savings_rate": percentage,
  "monthly_savings_target": amount,
  "financial_goal": "description of goal"
}}
"""
        response = self.llm.invoke([HumanMessage(content=prompt)])

        try:
            budget_plan = json.loads(response.content)
        except Exception:
            budget_plan = {
                "categories": analysis["category_totals"],
                "target_savings_rate": 20,
                "monthly_savings_target": analysis["total_income"] * 0.2,
                "financial_goal": "Build an emergency fund",
            }

        state["budget_plan"] = budget_plan
        return state

    # ---------- Node: Generate Final Coaching Message ---------- #

    def generate_coaching(self, state: AgentState) -> AgentState:
        profile = state["user_profile"]
        insights = state["insights"]
        recommendations = state["recommendations"]
        budget = state["budget_plan"]
        analysis = state["spending_analysis"]

        prompt = f"""
You are a supportive, encouraging financial coach speaking directly to a {profile.get('type', 'user')}.

Create a personalized coaching message (200-300 words) that:
1. Starts with encouragement and acknowledges their progress
2. Highlights 2-3 key insights about their spending
3. Provides 3-4 actionable recommendations
4. Introduces their personalized budget plan
5. Ends with motivation and next steps

Use a friendly, conversational tone. Address them directly ("you").

Context:
- Savings Rate: {analysis['savings_rate']:.1f}%
- Key Insights: {', '.join(insights[:3])}
- Top Recommendations: {', '.join(recommendations[:3])}
- Financial Goal: {budget.get('financial_goal', 'Build savings')}

Write the complete coaching message as plain text (not JSON).
"""
        response = self.llm.invoke([HumanMessage(content=prompt)])
        state["final_coaching"] = response.content

        return state

    # ---------- Public: Main coaching pipeline ---------- #

    def coach(self, user_profile: Dict, transactions: List[Dict]) -> Dict:
        """
        Run the full LangGraph pipeline and return results.
        """
        initial_state: AgentState = {
            "user_profile": user_profile,
            "transactions": transactions,
            "spending_analysis": {},
            "insights": [],
            "recommendations": [],
            "budget_plan": {},
            "messages": [],
            "final_coaching": "",
        }

        final_state = self.graph.invoke(initial_state)

        return {
            "user_profile": user_profile,
            "transactions": transactions,
            "spending_analysis": final_state["spending_analysis"],
            "insights": final_state["insights"],
            "recommendations": final_state["recommendations"],
            "budget_plan": final_state["budget_plan"],
            "coaching_message": final_state["final_coaching"],
        }

    # ---------- New: Generate alerts for Proactive Nudger ---------- #

    def generate_alerts(self, result: Dict) -> List[str]:
        """
        Simple rule-based alert engine (Level 2: Proactive nudger).

        Uses spending_analysis + budget_plan to create short alert messages.
        These alerts can be sent by email / push / WhatsApp etc.
        """
        analysis = result["spending_analysis"]
        budget = result["budget_plan"]

        alerts: List[str] = []

        savings_rate = analysis.get("savings_rate", 0.0)
        total_income = analysis.get("total_income", 0.0)
        total_spent = analysis.get("total_spent", 0.0)
        category_totals = analysis.get("category_totals", {})
        category_percentages = analysis.get("category_percentages", {})

        target_savings_rate = float(budget.get("target_savings_rate", 20.0))

        # 1) Low savings rate alert
        if total_income > 0 and savings_rate < (target_savings_rate - 5):
            alerts.append(
                f"Your current savings rate is {savings_rate:.1f}%, which is below your target of "
                f"{target_savings_rate:.1f}%. Try to reduce some non-essential spending this week."
            )

        # 2) Category overspending (e.g. > 30% of spending)
        for cat, pct in category_percentages.items():
            if pct > 30:
                alerts.append(
                    f"Spending on '{cat}' is {pct:.1f}% of your total expenses recently. "
                    f"Consider setting a weekly limit for this category."
                )

        # 3) High total spending vs income
        if total_income > 0 and total_spent > total_income * 0.9:
            alerts.append(
                "Your recent expenses are close to your income. You may want to pause big non-essential "
                "purchases until your savings buffer improves."
            )

        # 4) If no issues, send a positive nudge
        if not alerts and total_income > 0:
            alerts.append(
                "Nice work! Your spending and savings look healthy right now. Keep following your plan "
                "and reviewing your budget once a week."
            )

        return alerts


# ========= UTIL: Sending alerts (stub for Level 2) ========= #

def send_alert(user_profile: Dict, alert_text: str):
    """
    Level 2 'nudger' behavior. Right now, this just prints the alert.
    Replace this with email / SMS / WhatsApp integration as needed.
    """
    user_name = user_profile.get("name", "there")
    # In production, you might use:
    # - SMTP for email
    # - Twilio / WhatsApp API
    # - Push notifications, etc.
    print(f"\n[ALERT for {user_name}] {alert_text}\n")


# ========= MODES ========= #

def run_advisor_cli(agent: FinancialCoachAgent, user_id: int, days: int):
    """
    Level 1: Advisor only.
    - Run full analysis
    - Show coaching message
    - Open CLI chat loop
    """
    print(f"Fetching profile + last {days} days transactions for user_id={user_id}...")

    user_profile = get_user_profile_from_db(user_id)
    transactions = get_transactions_from_db(user_id, days)

    if not transactions:
        print(f"No transactions in last {days} days. Retrying with 365 days...")
        transactions = get_transactions_from_db(user_id, 365)

    if not transactions:
        print("Still no transactions found. Check your DB.")
        raise SystemExit(0)

    print(f"Found {len(transactions)} transactions. Running Financial Coach Agent...\n")

    result = agent.coach(user_profile, transactions)

    print("=== FINANCIAL COACHING RESULTS ===\n")
    print("COACHING MESSAGE:\n")
    print(result["coaching_message"])
    print("\n" + "=" * 60 + "\n")
    print("INSIGHTS:", json.dumps(result["insights"], indent=2))
    print("\nRECOMMENDATIONS:", json.dumps(result["recommendations"], indent=2))
    print("\nBUDGET PLAN:", json.dumps(result["budget_plan"], indent=2))

    # ========= CLI CHAT LOOP ========= #
    print("\nYou can now chat with your financial coach in the terminal.")
    print("Type 'exit', 'quit', or 'q' to end the conversation.\n")

    while True:
        user_input = input("You: ").strip()
        if user_input.lower() in ("exit", "quit", "q"):
            print("Coach: It was great talking with you. Keep going, you're on the right path! 👋")
            break

        chat_prompt = f"""
You are the same supportive financial coach who generated the analysis and plan below.

USER PROFILE:
{json.dumps(user_profile, indent=2)}

SPENDING ANALYSIS:
{json.dumps(result["spending_analysis"], indent=2)}

INSIGHTS:
{json.dumps(result["insights"], indent=2)}

RECOMMENDATIONS:
{json.dumps(result["recommendations"], indent=2)}

BUDGET PLAN:
{json.dumps(result["budget_plan"], indent=2)}

Now the user is asking a follow-up question.
Answer as the same friendly coach, in a clear, conversational way (3–6 sentences).
Don't repeat all the numbers unless it's needed; focus on being helpful and practical.

User's question: {user_input}
"""
        resp = agent.llm.invoke([HumanMessage(content=chat_prompt)])
        print("\nCoach:", resp.content, "\n")


def run_proactive_nudger(agent: FinancialCoachAgent, user_id: int, days: int):
    """
    Level 2: Proactive nudger.
    - Intended to be run on a schedule (cron / background job)
    - No CLI, no user input
    - Generates alerts and sends them via send_alert()
    """
    print(f"[NUDGER] Running proactive check for user_id={user_id} (last {days} days)...")

    user_profile = get_user_profile_from_db(user_id)
    transactions = get_transactions_from_db(user_id, days)

    if not transactions:
        print("[NUDGER] No transactions found in this period. Nothing to alert.")
        return

    result = agent.coach(user_profile, transactions)
    alerts = agent.generate_alerts(result)

    if not alerts:
        print("[NUDGER] No alerts generated. All good.")
        return

    print(f"[NUDGER] Generated {len(alerts)} alerts. Sending...")
    for alert_text in alerts:
        send_alert(user_profile, alert_text)


# ========= MAIN ENTRYPOINT ========= #

if __name__ == "__main__":
    # Gemini key
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY env var not set. Add it to your .env")

    agent = FinancialCoachAgent(api_key=api_key, model="gemini-2.5-flash")

    # Defaults from env
    user_id = int(os.environ.get("DEFAULT_USER_ID", "1"))
    days = int(os.environ.get("DEFAULT_DAYS", "30"))
    mode = os.environ.get("AGENT_MODE", "advisor").lower()

    if mode == "advisor":
        # Level 1: interactive advisor
        run_advisor_cli(agent, user_id, days)
    elif mode == "nudger":
        # Level 2: proactive nudger (non-interactive)
        run_proactive_nudger(agent, user_id, days)
    else:
        raise RuntimeError(f"Unknown AGENT_MODE: {mode}. Use 'advisor' or 'nudger'.")
