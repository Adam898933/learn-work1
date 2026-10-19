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
- Firebase remains the identity provider; the app's browser-local `groupchat_*` data is mirrored per account to Cloud through `/api/public/account-data`, which verifies the Firebase ID token and writes with the admin client (table has RLS and no client policies) — keeps accounts consistent across devices without exposing other users' data.
