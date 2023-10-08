/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        //Necessary to build the application cause EAS type error in their library
        ignoreBuildErrors: true,
      }
}

module.exports = nextConfig
