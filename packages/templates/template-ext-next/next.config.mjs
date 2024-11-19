/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "export",
	transpilePackages: ["@kksh/api"],
	experimental: {
		workerThreads: false,
		cpus: 1 // Limit to 1 CPU
	}
}

export default nextConfig
