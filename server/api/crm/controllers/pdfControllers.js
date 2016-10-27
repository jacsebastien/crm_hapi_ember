let logger      = require(`${process.cwd()}/utils/logger`);
let Boom        = require('boom');
let fs          = require('fs');
let fsPath      = require('fs-path');
let pdf         = require('html-pdf');
let Handlebars  = require('handlebars');

exports.createPdf = function(req, res) {
    logger.log("-- Create PDF");

    let base_dir = '../crm-api/public';
    
    // informations about the file and folder [parse the strings sent from ember to get sub objects of request]
    let file = JSON.parse(req.payload.file);
    // data to write inside the pdf
    let data = JSON.parse(req.payload.data);
    logger.log(file);
    // logger.log(data);

    let source_path = base_dir+file.template;
    // source = fs.readFileSync('public/documents/templates/body.hbs', 'utf8');
    let source = fs.readFileSync(source_path, 'utf8');    
    // logger.log(source);

    // get handlebars template from html
    let template = Handlebars.compile(source);  

    // insert data inside handlebars template
    var html_with_data = template(data);    
    // logger.log(html_with_data);

    // values for pdf creation
    var options = config = {
        // allowed units: A3, A4, A5, Legal, Letter, Tabloid 
        "format": "A4",        
        // portrait or landscape 
        "orientation": "portrait", 
        
        // default is 0, units: mm, cm, in, px 
        "border": {
            "top": "10px",            
            "right": "10px",
            "bottom": "10px",
            "left": "10px"
        },
        
        // File options 
        "type": "pdf"
    };

    if(file.folder) {
        logger.log('folder is defined');
        let destination_path = base_dir+file.folder;
        logger.log(destination_path);

        fsPath.mkdir(destination_path, function(err){
            if(err){
                logger.warn(err);
                res(Boom.badRequest(err));
                return;
            }
                
            logger.log('Folder has been created or already exists');
            if(file.filename) {
                logger.log('filename is defined');
                // concatenation of folder, filename and extention
                destination_path += "/" + file.filename + ".pdf";

                pdf.create(html_with_data, options).toFile(destination_path, function(err) {   //pdf.create(html_with_data, options).toFile('public/tmp/pdf_from_hbs.pdf', function(err) {
                    if(err){
                        logger.warn(err);  
                        res(Boom.badRequest(err));
                        return;
                    }
                    let attributes = {
                        message: 'PDF Created !',
                        path: destination_path
                    };
                    logger.log(attributes);
                    res(attributes);
                });
            } else {
                logger.warn('filename is not defined');
                res(Boom.badRequest('folder is not defined'));
            }
            
        });
    } else {
        logger.warn('folder is not defined');
        res(Boom.badRequest('folder is not defined'));
    }
}