
You are confusing "File Explorer" (Studio Step) with "Free Mode". Here is the difference:

## File Explorer (formerly Studio Ops)
This is for **managing existing files**.
- You use it to browse the file system.
- You can select a file and trigger a **regeneration** based on its existing spec/metadata.
- It is useful for debugging specific assets or manually triggering a build for a file you found on disk.

## Free Mode
This is for **creating new ideas** from scratch.
- It is a sandbox for prompting.
- You type a prompt manually.
- You select a checkpoint.
- It generates an image into a temporary folder (`assets/free`).
- It does NOT require a spec file or a project structure.
- It is useful for experimenting with prompts before you commit them to a Spec.
