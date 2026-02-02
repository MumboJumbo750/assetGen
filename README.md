# AssetsGen

A unified toolkit for AI-powered visual asset creation and management, featuring:
- **Asset Studio**: A web UI for importing requests, refining specifications, and batch generating assets.
- **LoRA Training Wizard**: Prepare datasets and configure training runs for custom model styles.
- **CLI Scripts**: For automation, validation, and integration with ComfyUI.

## Quick Start (UI)

1.  **Run the Studio**:
    ```powershell
    .\start_studio.ps1
    ```
    This script will start both the backend server (Port 8002) and frontend (Port 5173).
    Press **ENTER** in the console window to stop the servers and exit cleanly.

2.  **Open in Browser**: Navigate to `http://localhost:5173`.

3.  **Workflow**:
    -   **Import Requests**: Place markdown files in `requests/`. click "Import" in the Dashboard.
    -   **Refine Specs**: View and edit imported JSON specs.
    -   **Batch Generate**: Select assets, choose a checkpoint, and click "Generate".
    -   **Train Models**: Switch to the "Training" tab to prepare LoRA datasets.

## Manual Start

If you prefer running services separately:
- **Backend**: `python -m studio.backend.server` (runs on port 8002)
- **Frontend**: `cd studio/frontend && npm run dev` (runs on port 5173)

## Quick Start (CLI)

1.  Put new asset request files in `requests/`.
2.  Generate specs: `py -3.11 scripts/create_specs_from_index.py`
3.  Validate: `py -3.11 scripts/validate-assets.py --root assets/zelos`
4.  Generate with ComfyUI (see `ASSET_WORKFLOW.md`).
5.  Preview: `cd preview; py -3.11 -m http.server 5173`

## Repository Layout

```
.
|-- ASSET_WORKFLOW.md    # Detailed CLI workflow and quality bar
|-- README.md            # This file
|-- requests/            # Incoming asset request markdown files
|-- specs/               # Markdown specs, prompt docs, and project notes
|-- database/            # JSON data used by the app
|   |-- specs/           # JSON specifications for assets
|-- assets/              # Exported, web-optimized final assets
|-- scripts/             # CLI tools (validator, ComfyUI driver, etc.)
|-- studio/              # Unified web UI application
|   |-- backend/         # Python server (API, generation)
|   |-- frontend/        # React/Vite web app
`-- preview/             # Pixi.js app to inspect generated assets
```

