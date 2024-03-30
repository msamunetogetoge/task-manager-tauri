use std::result::Result;

pub trait Repository<T> {
    fn add(&self,  item: T) -> Result<String, String>;
    fn get(&self, id: &str) -> Result<Option<T>, String>;
    // 他の必要なメソッドをここに追加
}
