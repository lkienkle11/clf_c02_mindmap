use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    // After fs and dialog: it saves the folder scopes they grant and restores them on the next start.
    .plugin(tauri_plugin_persisted_scope::init())
    .plugin(
      tauri_plugin_sql::Builder::default()
        .add_migrations(
          "sqlite:mindmap.db",
          // Never edit a shipped migration: add the next NNNN_*.sql file and register it here.
          vec![
            Migration {
              version: 1,
              description: "init",
              sql: include_str!("../migrations/0001_init.sql"),
              kind: MigrationKind::Up,
            },
            Migration {
              version: 2,
              description: "attempt_question_index",
              sql: include_str!("../migrations/0002_attempt_question_index.sql"),
              kind: MigrationKind::Up,
            },
            Migration {
              version: 3,
              description: "attempt_clock_on_hidden",
              sql: include_str!("../migrations/0003_attempt_clock_on_hidden.sql"),
              kind: MigrationKind::Up,
            },
            Migration {
              version: 4,
              description: "checkpoint_attempts",
              sql: include_str!("../migrations/0004_checkpoint_attempts.sql"),
              kind: MigrationKind::Up,
            },
            Migration {
              version: 5,
              description: "reports",
              sql: include_str!("../migrations/0005_reports.sql"),
              kind: MigrationKind::Up,
            },
          ],
        )
        .build(),
    )
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}
