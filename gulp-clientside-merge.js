var through = require('through2');
var PluginError = require('gulp-util').PluginError;
var File = require('vinyl');
var path = require('path');

var PLUGIN_NAME = 'gulp-clientside-merge';

module.exports = function(file, export_var){
    
    if(export_var && typeof export_var === 'string'){
        export_var = 'var ' + export_var + ' = ';
    } else {
        export_var = '';
    }
    
    var lf = '\n';
    var header = export_var + 
        '(function(args){' + lf +
        '    var module, result;' + lf +
        '    for(var i = 0; i < args.length; i++){' + lf +
        '        module = { exports: {} };' + lf +
        '        args[i](module, module.exports);' + lf +
        '        if(i === 0){' + lf +
        '            result = module.exports();' + lf +
        '        } else {' + lf +
        '            module.exports(result);' + lf +
        '        }' + lf +
        '    }' + lf +
        '    return result;' + lf + 
        '})([';
    var footer = lf + ']);';
    var each_header = lf + 'function(module, exports){';
    var each_footer = lf + '}';
    var indent = lf + '    ';
    var line_returns = /(\r\n|\r|\n)/g;
    
    var content;
    var first_file;
    
    return through.obj(function(file, encoding, callback){
        if(file.isNull()){
            return callback(null, file);
        }
        
        if(file.isStream()){
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported'));
        }
        
        else if(file.isBuffer()){
            if(!content){
                content = [header];
                first_file = file;
            } else {
                content.push(',');
            }
            content.push(lf + '// ' + file.relative.replace('\\', '/') + each_header + indent);
            content.push(file.contents.toString('utf8').replace(line_returns, indent));
            content.push(each_footer);
            return callback();
        }
    }, function(callback){
        if(content){
            content.push(footer);
            
            var result;
            
            if(file && typeof file === 'string'){
                result = first_file.clone({ contents: false });
                result.path = path.join(first_file.base, file);
            } else {
                result = new File(file);
            }
            
            result.contents = Buffer.from(content.join(''));
            
            this.push(result);
        }
        callback();
    });
};