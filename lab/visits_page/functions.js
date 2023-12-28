function toggleHeaderAndFooter() {
    let header = $('.book-result .header');
    let footer = $('.book-result .footer2');
    header.each(function () {
        // toggle all header children
        $(this).children().toggle();
    });
    footer.each(function () {
        $(this).children().toggle();
    });
}

function saveResult(hash) {
    let result = {};
    $('.result').each(function () {
        let name = $(this).attr('name');
        let value = $(this).val();
        let hash = $(this).attr('id').split('_')[1];
        let color = $(`input[name=color_${hash}]:checked`).val();

        if (result[hash] == undefined) {
            result[hash] = {};
        }
        result[hash][name] = value;
        result[hash][`color_${name}`] = color ?? "dark";
    });
    let query = Object.entries(result).map(([hash, result]) => {
        return `update lab_visits_tests set result_test = '${JSON.stringify(result)}' where hash = '${hash}'`;
    }).join(';');
    run(query);
    showAddResult(hash);
}