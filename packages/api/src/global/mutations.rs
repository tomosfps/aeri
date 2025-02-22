pub fn get_mutation(mutation_name: &str) -> String {

    let update_media: &str = "
    mutation Mutation($status: MediaListStatus, $score: Float, $progress: Int, $ids: [Int]) {
    UpdateMediaListEntries(status: $status, score: $score, progress: $progress, ids: $ids) {
        media {
            id
            title {
                english
                native
                romaji
                }
            }
        }
    }";

    match mutation_name {
        "update_media" => update_media.to_string(),
        _ => panic!("Invalid Mutation Name"),
    }
}
