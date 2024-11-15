/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "export",
	transpilePackages: ["@kksh/api", "comlink-stdio"]
}

export default nextConfig
