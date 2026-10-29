<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Serve the supplied standalone Group Chat application in an isolated same-origin document embedded at the TanStack homepage, preserving its DOM-driven controls and bundled games without SSR execution.
- Normalize GIPHY message images through the same-origin image relay on send and render, so restricted networks can display both new messages and saved history.
- Keep the educational entry screen in the TanStack homepage and mount the isolated app only after a reload navigation, so first visits do not execute the chat document.
- Firebase remains the identity provider; the app's browser-local `groupchat_*` data is mirrored per account to Cloud through `/api/public/account-data`, which verifies the Firebase ID token and writes with the admin client (table has RLS and no client policies) — keeps accounts consistent across devices without exposing other users' data.
