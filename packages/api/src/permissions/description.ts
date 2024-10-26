import type { AllKunkunPermission } from "./schema"

export type PermissionDescriptions = Record<AllKunkunPermission, string>

export const permissionDescriptions: PermissionDescriptions = {
	"system:volumn": "Allows access to control system volume",
	"system:boot": "Allows sleep, restart, logout and shutdown, etc.",
	"system:disk": "Allows access to control disk (e.g. eject)",
	"system:apps": "Allows access to applications (e.g. find frontmost app, kill app)",
	"system:fs": "Allows access to the clean trash, get selected files",
	"system:ui": "Allows access to system UI components",
	"clipboard:read-all": "Allows reading all clipboard data",
	"clipboard:write-all": "Allows writing all clipboard data",
	"clipboard:read-text": "Allows reading text/html/rtf from the clipboard",
	"clipboard:write-text": "Allows writing text/html/rtf to the clipboard",
	"clipboard:read-image": "Allows reading images from the clipboard",
	"clipboard:write-image": "Allows writing images to the clipboard",
	"clipboard:read-files": "Allows reading copied files from the clipboard",
	"clipboard:write-files": "Allows writing files to the clipboard",
	"dialog:all": "Allows access to system dialog APIs, e.g. confirm, save, open, etc.",
	"notification:all": "Allows sending system notifications",
	"os:all": "Allows access to all operating system information",
	"shell:open": "Allows opening shell commands",
	"shell:execute": "Allows executing shell commands",
	"shell:spawn": "Allow spawning a new process and listen to the streaming of its output",
	"shell:kill": "Allows killing processes by pid. Need this to kill the process you started.",
	"shell:all":
		"Grant all shell related permissions. Path scope and args regex validation is still required.",
	"shell:stdin-write": "Allows writing to a command created.",
	"shell:deno:execute": "Allows executing deno script",
	"shell:deno:spawn": "Allow spawning a new deno process and listen to the streaming of its output",
	"fetch:all": "Allows making network requests",
	"system-info:all": "Allows access to all system information",
	"system-info:memory": "Allows access to system memory information",
	"system-info:cpu": "Allows access to system CPU information",
	"system-info:os": "Allows access to operating system information",
	"system-info:disk": "Allows access to disk information",
	"system-info:network": "Allows access to network information",
	"system-info:battery": "Allows access to battery information",
	"system-info:process": "Allows access to process information",
	"system-info:components": "Allows access to system components information",
	"network:interface": "Allows access to network interface information",
	"network:port": "Allows access to network port information",
	"updownload:download": "Allows downloading files",
	"updownload:upload": "Allows uploading files",
	/* -------------------------------------------------------------------------- */
	/*                                 File System                                */
	/* -------------------------------------------------------------------------- */
	// fs:allow-app-write-recursive
	"fs:search": "Allows searching files in the file system",
	"fs:read": "Allows reading files from the file system",
	"fs:read-dir":
		"Allows reading directories from the file system. Permissions to read files not granted, must be declared separately",
	"fs:write": "Allows writing files to the file system",
	"fs:exists": "Allows checking if a file exists in the file system",
	"fs:stat": "Allows getting file metadata from the file system",
	/* ---------------------------- File System Scope --------------------------- */
	// "fs:scope-download-recursive": "Allows reading files from the download directory and its subdirectories",
	// "fs:allow-desktop-read-recursive":
	// 	"Allows reading files from the desktop directory and its subdirectories",
	// "fs:allow-desktop-write-recursive":
	// 	"Allows writing files to the desktop directory and its subdirectories",
	// "fs:allow-documents-read-recursive":
	// 	"Allows reading files from the documents directory and its subdirectories",
	// "fs:allow-documents-write-recursive":
	// 	"Allows writing files to the documents directory and its subdirectories",
	// "fs:allow-downloads-read-recursive":
	// 	"Allows reading files from the download directory and its subdirectories",
	// "fs:allow-downloads-write-recursive":
	// 	"Allows writing files to the download directory and its subdirectories",
	// "fs:scope-download-recursive":
	// 	"Allow reading files from the download directory and its subdirectories",
	// "fs:scope-desktop-recursive":
	// 	"Allow reading files from the desktop directory and its subdirectories",
	// "fs:scope-documents-recursive":
	// 	"Allow reading files from the documents directory and its subdirectories"
	"open:url": "Open URLs",
	"open:file": "Open Files",
	"open:folder": "Open Folders",
	/* -------------------------------------------------------------------------- */
	/*                                    Event                                   */
	/* -------------------------------------------------------------------------- */
	"event:drag-drop": "Listen to file drop event",
	"event:drag-enter": "Listen to drag enter event",
	"event:drag-leave": "Listen to drag leave event",
	"event:drag-over": "Listen to drag over event",
	"event:window-blur": "Listen to window blur event",
	"event:window-close-requested": "Listen to window close requested event",
	"event:window-focus": "Listen to window focus event",
	/* -------------------------------------------------------------------------- */
	/*                                  Security                                  */
	/* -------------------------------------------------------------------------- */
	"security:mac:reveal-security-pane":
		"Reveal security privacy settings panel in Mac's System Preferences",
	"security:mac:verify-fingerprint": "Verify fingerprint",
	"security:mac:reset-screencapture-permission": "Reset  permission",
	"security:mac:request-permission": "Request security permission",
	"security:mac:check-permission": "Check security permission",
	"security:mac:all": "All Mac Security APIs"
}
