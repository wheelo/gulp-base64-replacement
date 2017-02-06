/**
 * @file gulp
 * @Erik
 */
var through = require('through2');
var fs = require('fs');
var path = require('path');
var customConfig = require('./gulp/config.js');
var _ = require('lodash');
var gulp = require('gulp');
var usemin = require('gulp-usemin');
var cssmin = require('gulp-cssmin');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');


_.extend(cfg, customConfig);

// 命令行操作
// 添加命名空间
// 指定目录
var cfg = {
    imgsRegExp: /(\.\.\/)*img/g,
    getImgsPath: function () {
        //var dir = dir || '';
        return './start/release/img/';
    },
    getProjectPath: function (htmlFileName) {
        //var dir = dir || '';
        return './start/release/' + htmlFileName;
    }
};


var p = cfg.getProjectPath;
var imgp = cfg.getImgsPath;

function build(file) {
    gulp.src(p(file))
        //.pipe(replaceScript())
        .pipe(usemin({
            inlinecss: [cssmin(), 'concat'],
            inlinejs: [uglify()],
            html: []
        }))
        .pipe(replaceImage())
        .pipe(gulp.dest('start/single/'));
}


var task = {
    dir: '',
    htmls: function () {
        return fs.readdirSync('./start/release/').filter(function (htmlFile) {
            return /\.html$/.test(htmlFile);
        });
    }
};

gulp.task('onehtml', function () {
    task.htmls().forEach(function (v) {
        build(v);
    });
});


gulp.task('default', ['onehtml']);






function replaceScript() {
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            cb();
            return;
        }

        var htmlContent = String(file.contents);

        var replaceList = cfg.replaceList;

        for (var i = 0, len = replaceList.length; i < len; i++) {
            console.log(new RegExp(replaceList[i][0], 'g'));
            htmlContent = htmlContent.replace(new RegExp(replaceList[i][0], 'g'), replaceList[i][1]);
        };

        file.contents = new Buffer(htmlContent);

        cb(null, file);
    });
}

function replaceImage() {
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            cb();
            return;
        }

        var htmlContent = String(file.contents);

        htmlContent = htmlContent.replace(cfg.imgsRegExp, 'img');

        fs.readdirSync(imgp()).forEach(function (v, i) {
            var mime = path.extname(v).substring(1);
            htmlContent = htmlContent.replace(new RegExp('img/' + v, 'g'), function () {
                return 'data:image/' + mime + ';base64,'
                    + new Buffer(fs.readFileSync(imgp() + v)).toString('base64');
            });
        });

        file.contents = new Buffer(htmlContent);

        cb(null, file);
    });
}

