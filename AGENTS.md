# Instructions for agents

Before adding, moving, or modifying code in this repository, read [architecture.md](architecture.md).

**Follow its architecture, service boundaries, file-placement rules, and coding practices STRICTLY.** Keep GraphQL schemas, resolvers, HTTP adapters, and TypeScript contracts in their designated modules. Keep domain logic and persistence in the owning service.

Check for more specific `AGENTS.md` instructions in the directory being changed. If the request leaves domain behavior, code placement, or an architecture change unclear, ask the user instead of assuming. Existing implementation gaps are not permission to copy unsafe patterns or reorganize unrelated code.

Keep `Readme.md` focused on the project description. Update `architecture.md` when an authorized change affects the documented architecture or coding rules. Verify changes with the relevant checks and state any checks that could not be run.
