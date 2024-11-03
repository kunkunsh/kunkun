use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, Runtime,
};

fn toggle_main_window<R: Runtime>(app: &tauri::AppHandle<R>) {
    let main_win = app.get_webview_window("main");

    if let Some(main_win) = main_win {
        if main_win.is_visible().unwrap() {
            main_win.hide().unwrap();
        } else {
            main_win.show().unwrap();
            main_win.set_focus().unwrap();
        }
    }
}

pub fn create_tray<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<()> {
    let toggle_i = MenuItem::with_id(app, "toggle", "Toggle", true, None::<&str>)?;
    let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu1 = Menu::with_items(app, &[&toggle_i, &quit_i])?;
    let _ = TrayIconBuilder::with_id("tray-1")
        .tooltip("Kunkun")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu1)
        .menu_on_left_click(true)
        .on_tray_icon_event(move |icon, event: TrayIconEvent| {
            // println!("on tray icon event: {:?}", event);
            match event {
                TrayIconEvent::Click {
                    button_state,
                    button,
                    ..
                } => match button {
                    MouseButton::Left => match button_state {
                        MouseButtonState::Up => {
                            toggle_main_window(icon.app_handle());
                        }
                        _ => {}
                    },
                    _ => {}
                },

                _ => {}
            }
        })
        .menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "toggle" => {
                toggle_main_window(app);
            }
            "quit" => {
                app.exit(0);
            }
            _ => {
                println!("unknown menu item: {:?}", event.id);
            }
        })
        // .on_menu_event(move |app, event| {
        //     println!("event: {:?}", event);
        //     let main_win = app.get_webview_window("main");
        //     if let Some(main_win) = main_win {
        //         main_win.show().unwrap();
        //         main_win.set_focus().unwrap();
        //     }
        // })
        .build(app);

    Ok(())
}
