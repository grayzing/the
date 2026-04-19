import decider
from rich import print

def pass_or_fail(result, desired_result,case):
    if result == desired_result:
        print(f"[bold green]CASE {case}: PASS[/bold green]")
    else:
        print(f"[bold red]CASE {case}: FAIL[/bold red]")

def testing_suite():
    print("TEST 1: derivatives_cheatsheet_screenshot.png")
    pass_or_fail(decider.webpage_classify("./screenshots_testing/derivatives_cheatsheet_screenshot.png", "calculus"), "true", 1)
    print("TEST 2: hard_rave_screenshot.png")
    pass_or_fail(decider.webpage_classify("./screenshots_testing/hard_rave_screenshot.png", "calculus"),"false", 2)
    print("TEST 3: unrel_reddit_screenshot.png")
    pass_or_fail(decider.webpage_classify("./screenshots_testing/unrel_reddit_screenshot.png", "calculus"),"false", 3)
    print("TEST 4: unrel_eigenvector_screenshot.png")
    pass_or_fail(decider.webpage_classify("./screenshots_testing/unrel_eigenvector_screenshot.png", "calculus"),"mismatch", 4)

testing_suite()