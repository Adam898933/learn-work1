import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

describe("Account creation", () => {
  it("submits username and password without requiring recovery answers", async () => {
    const html = readFileSync("public/group-chat.html", "utf8");
    const start = html.indexOf("  identityForm.addEventListener('submit'");
    const end = html.indexOf("  // An admin-approved rename", start);
    let submit: ((event: { preventDefault: () => void }) => void) | undefined;
    const fbCall = vi.fn().mockRejectedValue({ code: "TEST_STOP" });
    runInNewContext(html.slice(start, end), {
      identityForm: { addEventListener: (_: string, handler: typeof submit) => { submit = handler; } },
      authSubmitBtn: { disabled: false, textContent: "Create account" },
      authError: { textContent: "" },
      usernameInput: { value: "learningmember" },
      passwordInput: { value: "example-password" },
      authMode: "signup",
      usernameToEmail: () => "member@example.test",
      friendlyAuthError: () => "Stopped test request",
      fbCall,
    });
    if (!submit) throw new Error("Signup handler not registered");
    submit({ preventDefault: () => {} });
    await Promise.resolve();
    expect(fbCall).toHaveBeenCalledWith("signUp", {
      email: "member@example.test", password: "example-password", returnSecureToken: true,
    });
  });
});