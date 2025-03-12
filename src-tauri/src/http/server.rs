use actix_web::{App, HttpServer};
use tokio::net::TcpListener;

#[actix_web::main]
pub async fn main() -> std::io::Result<()> {
    match TcpListener::bind("127.0.0.1:8792").await {
        Ok(_) => {}
        Err(e) => {
            eprintln!("Failed to bind: {}", e);
            return Ok(());
        }
    }

    HttpServer::new(|| App::new())
        .bind(("127.0.0.1", 8792))?
        .run()
        .await
}
