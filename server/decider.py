"""
Written by Gray

This module uses agentic AI (Gemma 4 + LangChain) to decide if a given page is on-task.
Specifically, it requires a screenshot, page URL, and the given objectives, and integrates with
tooling to determine whether to boot the user to a previous, more relevant page.
"""