let
  pkgs = import <nixpkgs> {};
in
with pkgs;
stdenv.mkDerivation {
  name = "node";
  buildInputs = [
    nodejs-16_x
    # See https://github.com/NixOS/nixpkgs/issues/145634 for this workaround.
    # yarn is having trouble matching node versions, or using the current node
    # version. So we just force it with this override.
    (yarn.override {
      nodejs = nodejs-16_x;
    })
    # This is required to allow node-gyp to run so the binaries can be properly
    # emitted for fsevents. This is an adapted fix taken from here:
    # https://github.com/symphony-org/frost/commit/faee685c75f7fad7d7d6ad2c8f1e68053355c176
  ] ++ lib.optionals stdenv.isDarwin (with darwin.apple_sdk.frameworks; [
  ]);
  shellHook = ''
      export PATH="$PWD/node_modules/.bin/:$PATH"
      alias scripts='jq ".scripts" package.json'
  '';
}
