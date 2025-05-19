# Broker Copilot

A comprehensive multi-environment broker portal powered by AI to revolutionize insurance market intelligence and operational workflows, with advanced entity management capabilities.

## Key Components

- React-based responsive frontend with dynamic, context-aware navigation
- AI-driven predictive analytics for insurance ecosystems
- Advanced entity management with relationship-based filtering
- Modular architecture supporting flexible insurance technology solutions
- Intelligent routing with uniform interaction patterns
- Enhanced entity list management with bulk actions and cross-entity interactions
- Metrics management system with hierarchical and group-based views

## Environment Structure

The application is structured with a multi-environment architecture:
- My Qollabi (primary environment)
- ACME CO (client environment)
- Globex Corp (client environment)

Each environment has its own isolated data and configuration.

## OKR Component

The OKR (Objectives and Key Results) component follows a specific workflow:
1. Create metrics
2. Group with tags
3. Create grouped views of metrics that can be assigned to entities

### 🔀 Branching Strategy

- `main`: Stable version of the app. Only updated after full validation.
- `frie-dev`: Frie's working branch. Personal commits and features.
- `kam-dev`: Colleague's working branch. Personal commits and features.
- `demo`: Merge point between frie-dev and colleague-dev for testing and presentation.

🛠 Workflow:
1. Work on your own dev branch.
2. Regularly pull from `main` to stay up-to-date.
3. When ready, merge your branch into `demo`.
4. Only merge `demo` into `main` when it's fully tested.