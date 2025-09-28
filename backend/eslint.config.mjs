// @ts-check
import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{
		ignores: ["eslint.config.mjs"],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	eslintPluginPrettierRecommended,
	{
		languageOptions: {
			globals: {
				...globals.node,
				...globals.jest,
			},
			sourceType: "module",
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		rules: {
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/no-floating-promises": "error",
			"@typescript-eslint/no-unsafe-argument": "error",
			"@typescript-eslint/no-for-in-array": "error",
			"@typescript-eslint/no-extra-non-null-assertion": "error",
			"@typescript-eslint/no-empty-object-type": "warn",
			"@typescript-eslint/no-misused-new": "error",
			"@typescript-eslint/no-misused-promises": "error",
			"@typescript-eslint/no-require-imports": "error",
			"@typescript-eslint/no-unsafe-assignment": "error",
			"@typescript-eslint/no-unsafe-call": "warn",
			"@typescript-eslint/no-unsafe-return": "error",
			"@typescript-eslint/no-unused-expressions": "error",
			"@typescript-eslint/no-unused-vars": "error",
			"@typescript-eslint/no-unsafe-function-type": "warn",
			"@typescript-eslint/only-throw-error": "error",
			"@typescript-eslint/require-await": "error",
		},
	},
);
