export function buildLatest(input: {
  version: string;
  repo: string;
  tag: string;
  assets: { name: string }[];
  sigs: Record<string, string>;
}): {
  version: string;
  notes: string;
  pub_date: string;
  platforms: Record<
    'darwin-aarch64' | 'darwin-x86_64' | 'windows-x86_64' | 'linux-x86_64',
    { signature: string; url: string }
  >;
};
