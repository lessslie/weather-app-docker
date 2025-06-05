interface TailwindConfig {
  plugins: {
    tailwindcss: Record<string, unknown>;
    autoprefixer: Record<string, unknown>;
  };
}

const config: TailwindConfig = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
