use log::{info, warn};
use tauri::{Monitor, Runtime, WebviewWindow};

pub fn get_current_monitor<R: Runtime>(window: &WebviewWindow<R>) -> Monitor {
    use mouse_position::mouse_position::{Mouse, Position};

    let mouse_position = match Mouse::get_mouse_position() {
        Mouse::Position { x, y } => Position { x, y },
        Mouse::Error => {
            warn!("Mouse position not found, using primary monitor");
            return window.primary_monitor().unwrap().unwrap();
        }
    };

    info!("Mouse position: {} {}", mouse_position.x, mouse_position.y);

    let monitors = window.available_monitors().unwrap();

    for m in monitors {
        let dpi = m.scale_factor();
        let size = m.size().to_logical::<f64>(dpi);
        let position = m.position().to_logical(dpi);

        if mouse_position.x >= position.x
            && mouse_position.x <= (position.x + size.width as i32)
            && mouse_position.y >= position.y
            && mouse_position.y <= (position.y + size.height as i32)
        {
            info!("Current monitor found: {:?}", m);
            return m;
        }
    }
    warn!("Current monitor not found, using primary monitor");
    window.primary_monitor().unwrap().unwrap()
}
