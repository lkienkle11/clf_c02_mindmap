fn main() {
  println!("cargo:rerun-if-env-changed=APP_CHANNEL");
  println!("cargo::rustc-check-cfg=cfg(production)");
  if std::env::var("APP_CHANNEL").as_deref() == Ok("production") {
    println!("cargo:rustc-cfg=production");
  }
  tauri_build::build()
}
