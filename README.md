# AssetsGen

A unified toolkit for AI-powered visual asset creation and management, featuring:
- **Asset Studio**: A web UI for importing requests, refining specifications, and batch generating assets.
- **LoRA Training Wizard**: Prepare datasets and configure training runs for custom model styles.
- **CLI Scripts**: For automation, validation, and integration with ComfyUI.

## Quick Start (UI)

1.  **Build the Frontend**:
    ```bash
    cd studio/frontend
    npm install && npm run build
    ```
2.  **Run the Studio Server**:
    ```bash
    cd studio/backend
    py -3.11 -m studio.backend.server
    # Or, from repo root:
    # py -3.11 -m studio.backend.server
    ```
3.  **Open in Browser**: Navigate to `http://localhost:8002`.
4.  **Workflow**:
    -   **Import Requests**: Place markdown files in `requests/`. click "Import" in the Dashboard.
    -   **Refine Specs**: View and edit imported JSON specs.
    -   **Batch Generate**: Select assets, choose a checkpoint, and click "Generate".
    -   **Train Models**: Switch to the "Training" tab to prepare LoRA datasets.

## Quick Start (CLI)

1.  Put new asset request files in `requests/`.
2.  Generate specs: `py -3.11 scripts/create_specs_from_index.py`
3.  Validate: `py -3.11 scripts/validate-assets.py --root assets/zelos`
4.  Generate with ComfyUI (see `ASSET_WORKFLOW.md`).
5.  Preview: `cd preview; py -3.11 -m http.server 5173`

## Repository Layout

```
.
├── ASSET_WORKFLOW.md    # Detailed CLI workflow and quality bar
├── README.md            # This file
├── requests/            # Incoming asset request markdown files
├── specs/               # JSON specifications for assets
├── assets/              # Exported, web-optimized final assets
├── scripts/             # CLI tools (validator, ComfyUI driver, etc.)
├── studio/              # Unified web UI application
│   ├── backend/         # Python server (API, generation)
│   └── frontend/        # React/Vite web app
└── preview/             # Pixi.js app to inspect generated assets
```
