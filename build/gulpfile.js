var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),                     // 代码混淆
    sass = require('gulp-sass'),
    csslint = require('gulp-csslint'),
    rev = require('gulp-rev'),
    minifyCss = require('gulp-minify-css'),
    changed = require('gulp-changed'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    revCollector = require('gulp-rev-collector'),
    minifyHtml = require('gulp-minify-html'),
    autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),                      // 文件重命名 
    concat = require('gulp-concat'),                      // 文件合并
    imagemin = require('gulp-imagemin'),                  // 图片压缩插件
    pngquant = require('imagemin-pngquant'),              // png图片压缩插件
    cache = require('gulp-cache'), 
    del = require('del');


var cssSrc = ['_settings.scss', '_reset.scss', '_style.scss'],
    cssDest = 'assets/css',
    jsSrc = [
        'src/js/vendor/jquery.min.js',
        'src/js/vendor/PxLoader.js',
        'src/js/vendor/fastclick.js',
        'src/js/vendor/jweixin.js',
        'src/js/custom.js',
        'src/js/main.js',
    ],
    jsDest = 'assets/js',
    fontSrc = 'src/fonts/*',
    fontDest = 'assets/font',
    imgSrc = 'src/img/**',
    imgDest = 'assets/img',
    cssRevSrc = 'src/css/revCss',
    condition = true,
    mhtmlbool = false;

function changePath(basePath){
    var nowCssSrc = [];
    for (var i = 0; i < cssSrc.length; i++) {
        nowCssSrc.push(cssRevSrc + '/' + cssSrc[i]);
    }
    return nowCssSrc;
}

//Fonts & Images 根据MD5获取版本号
gulp.task('revFont', function(){
    return gulp.src(fontSrc)
        .pipe(rev())
        .pipe(gulp.dest(fontDest))
        .pipe(rev.manifest())
        .pipe(gulp.dest('src/rev/font'));
});
gulp.task('revImg', function(){
    return gulp.src(imgSrc)
        .pipe(cache(imagemin({
            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true, //类型：Boolean 默认：false 多次优化svg直到完全优化
            svgoPlugins: [{removeViewBox: false}], //不要移除svg的viewbox属性
            use: [pngquant({quality: '60'})] //使用pngquant来压缩png图片
        })))
        .pipe(rev())
        .pipe(gulp.dest(imgDest))
        .pipe(rev.manifest())
        .pipe(gulp.dest('src/rev/img'));
});



//检测JS
gulp.task('lintJs', function(){
    return gulp.src(jsSrc)
        //.pipe(jscs())   //检测JS风格
        .pipe(jshint({
            "undef": false,
            "unused": false
        }))
        //.pipe(jshint.reporter('default'))  //错误默认提示
        .pipe(jshint.reporter(stylish))   //高亮提示
        .pipe(jshint.reporter('fail'));
});

//压缩JS/生成版本号
gulp.task('miniJs', function(){
    return gulp.src(jsSrc)
        .pipe(concat('main.js'))                  //合并所有js到main.js
        .pipe(rename({suffix: '.min'}))           //rename压缩后的文件名
        .pipe(gulpif(
            condition, uglify()
        ))
        .pipe(rev())
        .pipe(gulp.dest(jsDest))
        .pipe(rev.manifest())
        .pipe(gulp.dest('src/rev/js'));
});

//CSS里更新引入文件版本号
gulp.task('revCollectorCss', function () {

    if(condition){
        csssrcoo = ['src/css/*.scss']
    }else{
        csssrcoo = ['src/rev/**/*.json', 'src/css/*.scss']
    }

    return gulp.src(csssrcoo)
        .pipe(revCollector())
        .pipe(gulp.dest(cssRevSrc));
});

//检测CSS
gulp.task('lintCss', function(){
    return gulp.src(cssSrc)
        .pipe(csslint())
        .pipe(csslint.reporter())
        .pipe(csslint.failReporter());
});


//压缩/合并CSS/生成版本号
gulp.task('miniCss', function(){
    return gulp.src(changePath(cssRevSrc))
        .pipe(concat('main.css'))                  //合并所有css到main.css
        .pipe(rename({suffix: '.min'}))           //rename压缩后的文件名
        .pipe(sass())
        .pipe(gulpif(
            condition, minifyCss({
                compatibility: 'ie7'
            })
        ))
        .pipe(rev())
        .pipe(gulpif(
                condition, changed(cssDest)
        ))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false,
            remove: false       
        }))
        .pipe(gulp.dest(cssDest))
        .pipe(rev.manifest())
        .pipe(gulp.dest('src/rev/css'));
});

//压缩Html/更新引入文件版本
gulp.task('miniHtml', function () {
    if(mhtmlbool){
        htmlsrc = ['src/*.html']
    }else{
        htmlsrc = ['src/rev/**/*.json', 'src/*.html']
    }
    return gulp.src(htmlsrc) // 'src/rev/**/*.json'
        .pipe(revCollector())
        .pipe(gulpif(
            mhtmlbool, minifyHtml({
                empty: true,
                spare: true,
                quotes: true
            })
        ))
        .pipe(gulp.dest('../test'));
});

gulp.task('delRevCss', function(){
    del([cssRevSrc,cssRevSrc.replace('src/', 'assets/')]);    
});

//意外出错？清除缓存文件
gulp.task('clean', function(){
    del([cssRevSrc ,cssRevSrc.replace('src/', 'assets/')]);
});



//开发构建
gulp.task('dev', function (done) {
    condition = false;
    runSequence(
         ['revFont', 'revImg'],
         //['lintJs'],
         ['revCollectorCss'],
         ['miniCss', 'miniJs'],
         ['miniHtml', 'delRevCss'],
    done);
});

//正式构建
gulp.task('build', function (done) {
    mhtmlbool = true;
    runSequence(
         ['revFont', 'revImg'],
         //['lintJs'],
         ['revCollectorCss'],
         ['miniCss', 'miniJs'],
         ['miniHtml', 'delRevCss'],    
    done);
});


gulp.task('default', ['build']);
