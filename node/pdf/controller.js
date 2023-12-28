const { generatePdf } = require("./utils");

exports.print = async (req, res, next) => {
    // Access-Control-Allow-Origin
    res.setHeader("Access-Control-Allow-Origin", "*");
    const pk = req.query.pk;
    // check if pk is not null
    if (pk) {
        console.log(`pk: ${pk}`);
        await generatePdf(pk).then((pdf) => {
            res.contentType("application/pdf");
            res.send(pdf);
        }).catch((err) => {
            console.log(err);
        });
    } else {
        console.log("pk is null");
        res.send("pk is null");
    }
}
