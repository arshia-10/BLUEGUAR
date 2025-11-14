from .blueguard_engine import blueguard_response

ALLOWED_RISKS = {"Flood Risk: HIGH", "Flood Risk: MEDIUM", "Flood Risk: LOW"}

FLOOD_TESTS = [
    "Is there any flood danger today?",
    "What is the flood risk now?",
    "Will it rain heavily tomorrow?",
    "Is there storm risk today?",
    "Tell me weather risk?",
    "Is there any water level danger?",
    "Is baarish ka risk hai?",
    "What is today's rainfall risk?",
    "Is it safe from flood today?",
    "Any storm or flood alert?"
]

NORMAL_TESTS = [
    "Who is the prime minister of India?",
    "What is Python programming?",
    "Tell me a joke.",
    "What is 10 + 20?",
    "Explain gravity."
]

def run_tests():
    total = 0
    passed = 0

    print("=== FLOOD TESTS ===")
    for q in FLOOD_TESTS:
        total += 1
        ans = blueguard_response(q)
        ok = ans in ALLOWED_RISKS or (ans.startswith("Flood Risk:") and any(r in ans for r in ["HIGH","MEDIUM","LOW"]))
        print(f"Q: {q}\nA: {ans}\nResult: {'PASS' if ok else 'FAIL'}\n")
        if ok: passed += 1

    print("=== NORMAL TESTS ===")
    for q in NORMAL_TESTS:
        total += 1
        ans = blueguard_response(q)
        ok = ans not in ALLOWED_RISKS and len(ans.split()) >= 3
        print(f"Q: {q}\nA: {ans}\nResult: {'PASS' if ok else 'FAIL'}\n")
        if ok: passed += 1

    print(f"Final: {passed}/{total} tests passed.")

if __name__ == "__main__":
    run_tests()
