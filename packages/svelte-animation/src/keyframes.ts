import type { Config } from "tailwindcss"

export const shinePulse: NonNullable<NonNullable<Config["theme"]>["extend"]>["keyframes"] = {
	"border-beam": {
		"100%": {
			"offset-distance": "100%"
		}
	},
	"text-gradient": {
		to: {
			backgroundPosition: "200% center"
		}
	},
	meteor: {
		"0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
		"70%": { opacity: "1" },
		"100%": {
			transform: "rotate(215deg) translateX(-500px)",
			opacity: "0"
		}
	},
	grid: {
		"0%": { transform: "translateY(-50%)" },
		"100%": { transform: "translateY(0)" }
	},
	"aurora-border": {
		"0%, 100%": { borderRadius: "37% 29% 27% 27% / 28% 25% 41% 37%" },
		"25%": { borderRadius: "47% 29% 39% 49% / 61% 19% 66% 26%" },
		"50%": { borderRadius: "57% 23% 47% 72% / 63% 17% 66% 33%" },
		"75%": { borderRadius: "28% 49% 29% 100% / 93% 20% 64% 25%" }
	},
	"aurora-1": {
		"0%, 100%": { top: "0", right: "0" },
		"50%": { top: "50%", right: "25%" },
		"75%": { top: "25%", right: "50%" }
	},
	"aurora-2": {
		"0%, 100%": { top: "0", left: "0" },
		"60%": { top: "75%", left: "25%" },
		"85%": { top: "50%", left: "50%" }
	},
	"aurora-3": {
		"0%, 100%": { bottom: "0", left: "0" },
		"40%": { bottom: "50%", left: "25%" },
		"65%": { bottom: "25%", left: "50%" }
	},
	"aurora-4": {
		"0%, 100%": { bottom: "0", right: "0" },
		"50%": { bottom: "25%", right: "40%" },
		"90%": { bottom: "50%", right: "25%" }
	},
	"shine-pulse": {
		"0%": {
			"background-position": "0% 0%"
		},
		"50%": {
			"background-position": "100% 100%"
		},
		to: {
			"background-position": "0% 0%"
		}
	}
}
