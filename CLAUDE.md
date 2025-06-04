# Bash commands

-   npm run build: Build the project
-   npm run type-check: Run the typechecker

# UI

-   Prefer Shadcn-Vue components (https://www.shadcn-vue.com/)

# Code style

-   Use ES modules (import/export) syntax, not CommonJS (require)
-   Destructure imports when possible (eg. import { foo } from 'bar')
-   Do not use Typescript any type

# Workflow

-   Be sure to typecheck when you’re done making a series of code changes

# OpenAPI

-   Do not change any code that exists within the src/generated/ directory. This is auto-generated code from the @hey-api/openapi-ts package and will be overriden.

# llm.txt

-   vlm.run's llm.txt can be viewed here: https://docs.vlm.run/llms-full.txt
-   Use the llm.txt to inspect the inner workings of vlm.run's api and how you may interact with it.
