import decider

def pass_or_fail(result, desired_result):
    if result == desired_result:
        print("PASS")
    else:
        print("FAIL")

def testing_suite():
    print("TEST 1: derivatives_cheatsheet_screenshot.png")
    pass_or_fail(decider.webpage_classify("./screenshots_testing/derivatives_cheatsheet_screenshot.png", "calculus"), True)
    print("TEST 2: hard_rave_screenshot.png")
    pass_or_fail(decider.webpage_classify("./screenshots_testing/hard_rave_screenshot.png", "calculus"),False)
    print("TEST 3: unrel_reddit_screenshot.png")
    pass_or_fail(decider.webpage_classify("./screenshots_testing/unrel_reddit_screenshot.png", "calculus"),False)

testing_suite()