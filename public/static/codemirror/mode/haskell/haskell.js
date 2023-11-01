// Workaround for missing functionality in IE 8 and earlier.
if( Object.create === undefined ) {
	Object.create = function( o ) {
	    function F(){}
	    F.prototype = o;
	    return new F();
	};
}

CodeMirror.defineMode("haskell", function(config, modeConfig) {

  function switchState(source, state, setState, f) {
    setState(f, state);
    return f(source, state, setState);
  }

/*
  // Unicode extension via http://inimino.org/~inimino/blog/javascript_cset
  //
  // unicodeCategories = function(xs) { var res = nil; xs.forEach(function(x) { res = union(res, fromUnicodeGeneralCategory(x)); }); return res; }
  //
  // toRegex(unicodeCategories(['Ll']))
  var smallRE = /[a-zªµºß-öø-ÿāăąćĉċčďđēĕėęěĝğġģĥħĩīĭįıĳĵķ-ĸĺļľŀłńņň-ŉŋōŏőœŕŗřśŝşšţťŧũūŭůűųŵŷźżž-ƀƃƅƈƌ-ƍƒƕƙ-ƛƞơƣƥƨƪ-ƫƭưƴƶƹ-ƺƽ-ƿǆǉǌǎǐǒǔǖǘǚǜ-ǝǟǡǣǥǧǩǫǭǯ-ǰǳǵǹǻǽǿȁȃȅȇȉȋȍȏȑȓȕȗșțȝȟȡȣȥȧȩȫȭȯȱȳ-ȹȼȿ-ɀɂɇɉɋɍɏ-ʓʕ-ʯͱͳͷͻ-ͽΐά-ώϐ-ϑϕ-ϗϙϛϝϟϡϣϥϧϩϫϭϯ-ϳϵϸϻ-ϼа-џѡѣѥѧѩѫѭѯѱѳѵѷѹѻѽѿҁҋҍҏґғҕҗҙқҝҟҡңҥҧҩҫҭүұҳҵҷҹһҽҿӂӄӆӈӊӌӎ-ӏӑӓӕӗәӛӝӟӡӣӥӧөӫӭӯӱӳӵӷӹӻӽӿԁԃԅԇԉԋԍԏԑԓԕԗԙԛԝԟԡԣա-ևᴀ-ᴫᵢ-ᵷᵹ-ᶚḁḃḅḇḉḋḍḏḑḓḕḗḙḛḝḟḡḣḥḧḩḫḭḯḱḳḵḷḹḻḽḿṁṃṅṇṉṋṍṏṑṓṕṗṙṛṝṟṡṣṥṧṩṫṭṯṱṳṵṷṹṻṽṿẁẃẅẇẉẋẍẏẑẓẕ-ẝẟạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹỻỽỿ-ἇἐ-ἕἠ-ἧἰ-ἷὀ-ὅὐ-ὗὠ-ὧὰ-ώᾀ-ᾇᾐ-ᾗᾠ-ᾧᾰ-ᾴᾶ-ᾷιῂ-ῄῆ-ῇῐ-ΐῖ-ῗῠ-ῧῲ-ῴῶ-ῷⁱⁿℊℎ-ℏℓℯℴℹℼ-ℽⅆ-ⅉⅎↄⰰ-ⱞⱡⱥ-ⱦⱨⱪⱬⱱⱳ-ⱴⱶ-ⱼⲁⲃⲅⲇⲉⲋⲍⲏⲑⲓⲕⲗⲙⲛⲝⲟⲡⲣⲥⲧⲩⲫⲭⲯⲱⲳⲵⲷⲹⲻⲽⲿⳁⳃⳅⳇⳉⳋⳍⳏⳑⳓⳕⳗⳙⳛⳝⳟⳡⳣ-ⳤⴀ-ⴥꙁꙃꙅꙇꙉꙋꙍꙏꙑꙓꙕꙗꙙꙛꙝꙟꙣꙥꙧꙩꙫꙭꚁꚃꚅꚇꚉꚋꚍꚏꚑꚓꚕꚗꜣꜥꜧꜩꜫꜭꜯ-ꜱꜳꜵꜷꜹꜻꜽꜿꝁꝃꝅꝇꝉꝋꝍꝏꝑꝓꝕꝗꝙꝛꝝꝟꝡꝣꝥꝧꝩꝫꝭꝯꝱ-ꝸꝺꝼꝿꞁꞃꞅꞇꞌﬀ-ﬆﬓ-ﬗａ-ｚ]|\ud801[\udc28-\udc4f]|\ud835[\udc1a-\udc33\udc4e-\udc54\udc56-\udc67\udc82-\udc9b\udcb6-\udcb9\udcbb\udcbd-\udcc3\udcc5-\udccf\udcea-\udd03\udd1e-\udd37\udd52-\udd6b\udd86-\udd9f\uddba-\uddd3\uddee-\ude07\ude22-\ude3b\ude56-\ude6f\ude8a-\udea5\udec2-\udeda\udedc-\udee1\udefc-\udf14\udf16-\udf1b\udf36-\udf4e\udf50-\udf55\udf70-\udf88\udf8a-\udf8f\udfaa-\udfc2\udfc4-\udfc9\udfcb]/;
  // toRegex(unicodeCategories(['Lu', 'Lt']))
  var largeRE = /[A-ZÀ-ÖØ-ÞĀĂĄĆĈĊČĎĐĒĔĖĘĚĜĞĠĢĤĦĨĪĬĮİĲĴĶĹĻĽĿŁŃŅŇŊŌŎŐŒŔŖŘŚŜŞŠŢŤŦŨŪŬŮŰŲŴŶŸ-ŹŻŽƁ-ƂƄƆ-ƇƉ-ƋƎ-ƑƓ-ƔƖ-ƘƜ-ƝƟ-ƠƢƤƦ-ƧƩƬƮ-ƯƱ-ƳƵƷ-ƸƼǄ-ǅǇ-ǈǊ-ǋǍǏǑǓǕǗǙǛǞǠǢǤǦǨǪǬǮǱ-ǲǴǶ-ǸǺǼǾȀȂȄȆȈȊȌȎȐȒȔȖȘȚȜȞȠȢȤȦȨȪȬȮȰȲȺ-ȻȽ-ȾɁɃ-ɆɈɊɌɎͰͲͶΆΈ-ΊΌΎ-ΏΑ-ΡΣ-ΫϏϒ-ϔϘϚϜϞϠϢϤϦϨϪϬϮϴϷϹ-ϺϽ-ЯѠѢѤѦѨѪѬѮѰѲѴѶѸѺѼѾҀҊҌҎҐҒҔҖҘҚҜҞҠҢҤҦҨҪҬҮҰҲҴҶҸҺҼҾӀ-ӁӃӅӇӉӋӍӐӒӔӖӘӚӜӞӠӢӤӦӨӪӬӮӰӲӴӶӸӺӼӾԀԂԄԆԈԊԌԎԐԒԔԖԘԚԜԞԠԢԱ-ՖႠ-ჅḀḂḄḆḈḊḌḎḐḒḔḖḘḚḜḞḠḢḤḦḨḪḬḮḰḲḴḶḸḺḼḾṀṂṄṆṈṊṌṎṐṒṔṖṘṚṜṞṠṢṤṦṨṪṬṮṰṲṴṶṸṺṼṾẀẂẄẆẈẊẌẎẐẒẔẞẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼẾỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴỶỸỺỼỾἈ-ἏἘ-ἝἨ-ἯἸ-ἿὈ-ὍὙὛὝὟὨ-Ὧᾈ-ᾏᾘ-ᾟᾨ-ᾯᾸ-ᾼῈ-ῌῘ-ΊῨ-ῬῸ-ῼℂℇℋ-ℍℐ-ℒℕℙ-ℝℤΩℨK-ℭℰ-ℳℾ-ℿⅅↃⰀ-ⰮⱠⱢ-ⱤⱧⱩⱫⱭ-ⱯⱲⱵⲀⲂⲄⲆⲈⲊⲌⲎⲐⲒⲔⲖⲘⲚⲜⲞⲠⲢⲤⲦⲨⲪⲬⲮⲰⲲⲴⲶⲸⲺⲼⲾⳀⳂⳄⳆⳈⳊⳌⳎⳐⳒⳔⳖⳘⳚⳜⳞⳠⳢꙀꙂꙄꙆꙈꙊꙌꙎꙐꙒꙔꙖꙘꙚꙜꙞꙢꙤꙦꙨꙪꙬꚀꚂꚄꚆꚈꚊꚌꚎꚐꚒꚔꚖꜢꜤꜦꜨꜪꜬꜮꜲꜴꜶꜸꜺꜼꜾꝀꝂꝄꝆꝈꝊꝌꝎꝐꝒꝔꝖꝘꝚꝜꝞꝠꝢꝤꝦꝨꝪꝬꝮꝹꝻꝽ-ꝾꞀꞂꞄꞆꞋＡ-Ｚ]|\ud801[\udc00-\udc27]|\ud835[\udc00-\udc19\udc34-\udc4d\udc68-\udc81\udc9c\udc9e-\udc9f\udca2\udca5-\udca6\udca9-\udcac\udcae-\udcb5\udcd0-\udce9\udd04-\udd05\udd07-\udd0a\udd0d-\udd14\udd16-\udd1c\udd38-\udd39\udd3b-\udd3e\udd40-\udd44\udd46\udd4a-\udd50\udd6c-\udd85\udda0-\uddb9\uddd4-\udded\ude08-\ude21\ude3c-\ude55\ude70-\ude89\udea8-\udec0\udee2-\udefa\udf1c-\udf34\udf56-\udf6e\udf90-\udfa8\udfca]/;
  // "(?:" + toRegex(unicodeCategories(['Nd'])) + ")+"
  var digitsRE = /(?:[0-9٠-٩۰-۹߀-߉०-९০-৯੦-੯૦-૯୦-୯௦-௯౦-౯೦-೯൦-൯๐-๙໐-໙༠-༩၀-၉႐-႙០-៩᠐-᠙᥆-᥏᧐-᧙᭐-᭙᮰-᮹᱀-᱉᱐-᱙꘠-꘩꣐-꣙꤀-꤉꩐-꩙０-９]|\ud801[\udca0-\udca9]|\ud835[\udfce-\udfff])+/;
  // "(?:" + toRegex(union(union(fromCharRange('A','F'), fromCharRange('a','f')),unicodeCategories(['Nd']))) + ")+"
  var hexRE = /(?:[0-9A-Fa-f٠-٩۰-۹߀-߉०-९০-৯੦-੯૦-૯୦-୯௦-௯౦-౯೦-೯൦-൯๐-๙໐-໙༠-༩၀-၉႐-႙០-៩᠐-᠙᥆-᥏᧐-᧙᭐-᭙᮰-᮹᱀-᱉᱐-᱙꘠-꘩꣐-꣙꤀-꤉꩐-꩙０-９]|\ud801[\udca0-\udca9]|\ud835[\udfce-\udfff])+/;
  var octRE = /(?:[0-7])+/;
  // "(?:" + toRegex(union(unicodeCategories(['Ll', 'Lu', 'Lt', 'Nd']), fromString("'"))) + ")*"
*/
//  var idRE = /(?:['0-9A-Za-zªµºÀ-ÖØ-öø-ƺƼ-ƿǄ-ʓʕ-ʯͰ-ͳͶ-ͷͻ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԣԱ-Ֆա-և٠-٩۰-۹߀-߉०-९০-৯੦-੯૦-૯୦-୯௦-௯౦-౯೦-೯൦-൯๐-๙໐-໙༠-༩၀-၉႐-႙Ⴀ-Ⴥ០-៩᠐-᠙᥆-᥏᧐-᧙᭐-᭙᮰-᮹᱀-᱉᱐-᱙ᴀ-ᴫᵢ-ᵷᵹ-ᶚḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℴℹℼ-ℿⅅ-ⅉⅎↃ-ↄⰀ-Ⱞⰰ-ⱞⱠ-Ɐⱱ-ⱼⲀ-ⳤⴀ-ⴥ꘠-꘩Ꙁ-ꙟꙢ-ꙭꚀ-ꚗꜢ-ꝯꝱ-ꞇꞋ-ꞌ꣐-꣙꤀-꤉꩐-꩙ﬀ-ﬆﬓ-ﬗ０-９Ａ-Ｚａ-ｚ]|\ud801[\udc00-\udc4f\udca0-\udca9]|\ud835[\udc00-\udc54\udc56-\udc9c\udc9e-\udc9f\udca2\udca5-\udca6\udca9-\udcac\udcae-\udcb9\udcbb\udcbd-\udcc3\udcc5-\udd05\udd07-\udd0a\udd0d-\udd14\udd16-\udd1c\udd1e-\udd39\udd3b-\udd3e\udd40-\udd44\udd46\udd4a-\udd50\udd52-\udea5\udea8-\udec0\udec2-\udeda\udedc-\udefa\udefc-\udf14\udf16-\udf34\udf36-\udf4e\udf50-\udf6e\udf70-\udf88\udf8a-\udfa8\udfaa-\udfc2\udfc4-\udfcb\udfce-\udfff])*/;
/*
  // "(?:" + toRegex(union(unicodeCategories(['Ll', 'Lu', 'Lt', 'Nd']), fromString(".'"))) + ")*\\."
  var qualRE = /(?:['.0-9A-Za-zªµºÀ-ÖØ-öø-ƺƼ-ƿǄ-ʓʕ-ʯͰ-ͳͶ-ͷͻ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԣԱ-Ֆա-և٠-٩۰-۹߀-߉०-९০-৯੦-੯૦-૯୦-୯௦-௯౦-౯೦-೯൦-൯๐-๙໐-໙༠-༩၀-၉႐-႙Ⴀ-Ⴥ០-៩᠐-᠙᥆-᥏᧐-᧙᭐-᭙᮰-᮹᱀-᱉᱐-᱙ᴀ-ᴫᵢ-ᵷᵹ-ᶚḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℴℹℼ-ℿⅅ-ⅉⅎↃ-ↄⰀ-Ⱞⰰ-ⱞⱠ-Ɐⱱ-ⱼⲀ-ⳤⴀ-ⴥ꘠-꘩Ꙁ-ꙟꙢ-ꙭꚀ-ꚗꜢ-ꝯꝱ-ꞇꞋ-ꞌ꣐-꣙꤀-꤉꩐-꩙ﬀ-ﬆﬓ-ﬗ０-９Ａ-Ｚａ-ｚ]|\ud801[\udc00-\udc4f\udca0-\udca9]|\ud835[\udc00-\udc54\udc56-\udc9c\udc9e-\udc9f\udca2\udca5-\udca6\udca9-\udcac\udcae-\udcb9\udcbb\udcbd-\udcc3\udcc5-\udd05\udd07-\udd0a\udd0d-\udd14\udd16-\udd1c\udd1e-\udd39\udd3b-\udd3e\udd40-\udd44\udd46\udd4a-\udd50\udd52-\udea5\udea8-\udec0\udec2-\udeda\udedc-\udefa\udefc-\udf14\udf16-\udf34\udf36-\udf4e\udf50-\udf6e\udf70-\udf88\udf8a-\udfa8\udfaa-\udfc2\udfc4-\udfcb\udfce-\udfff])*\./;
  // toRegex(difference(union(fromString("!#$%&*+./<=>?@\\^|-~"), unicodeCategories(['Pc', 'Pd', 'Pe', 'Pf', 'Pi', 'Po', 'Ps', 'Sc', 'Sk', 'Sm', 'So'])), fromString("[(),;[]`{}_:\"'")))
  var symbolRE = /[!#-&*-+\--/<-@\\^|~¡-©«-¬®-±´¶-¸»¿×÷˂-˅˒-˟˥-˫˭˯-˿͵;΄-΅·϶҂՚-՟։-֊־׀׃׆׳-״؆-؏؛؞-؟٪-٭۔۩۽-۾܀-܍߶-߹।-॥॰৲-৳৺૱୰௳-௺౿ೱ-ೲ൹෴฿๏๚-๛༁-༗༚-༟༴༶༸༺-༽྅྾-࿅࿇-࿌࿎-࿔၊-၏႞-႟჻፠-፨᎐-᎙᙭-᙮᚛-᚜᛫-᛭᜵-᜶។-៖៘-៛᠀-᠊᥀᥄-᥅᧞-᧿᨞-᨟᭚-᭪᭴-᭼᰻-᰿᱾-᱿᾽᾿-῁῍-῏῝-῟῭-`´-῾‐-‧‰-⁞⁺-⁾₊-₎₠-₵℀-℁℃-℆℈-℉℔№-℘℞-℣℥℧℩℮℺-℻⅀-⅄⅊-⅍⅏←-⏧␀-␦⑀-⑊⒜-ⓩ─-⚝⚠-⚼⛀-⛃✁-✄✆-✉✌-✧✩-❋❍❏-❒❖❘-❞❡-❵➔➘-➯➱-➾⟀-⟊⟌⟐-⭌⭐-⭔⳥-⳪⳹-⳼⳾-⳿⸀-⸮⸰⺀-⺙⺛-⻳⼀-⿕⿰-⿻、-〄〈-〠〰〶-〷〽-〿゛-゜゠・㆐-㆑㆖-㆟㇀-㇣㈀-㈞㈪-㉃㉐㉠-㉿㊊-㊰㋀-㋾㌀-㏿䷀-䷿꒐-꓆꘍-꘏꙳꙾꜀-꜖꜠-꜡꞉-꞊꠨-꠫꡴-꡷꣎-꣏꤮-꤯꥟꩜-꩟﬩﴾-﴿﷼-﷽︐-︙︰-﹒﹔-﹦﹨-﹫！-／：-＠［-｀｛-･￠-￦￨-￮￼-�]|\ud800[\udd00-\udd02\udd37-\udd3f\udd79-\udd89\udd90-\udd9b\uddd0-\uddfc\udf9f\udfd0]|\ud802[\udd1f\udd3f\ude50-\ude58]|\ud809[\udc70-\udc73]|\ud834[\udc00-\udcf5\udd00-\udd26\udd29-\udd64\udd6a-\udd6c\udd83-\udd84\udd8c-\udda9\uddae-\udddd\ude00-\ude41\ude45\udf00-\udf56]|\ud835[\udec1\udedb\udefb\udf15\udf35\udf4f\udf6f\udf89\udfa9\udfc3]|\ud83c[\udc00-\udc2b\udc30-\udc93]/;
  var specialRE = /[(),;[\]`{}]/;
  // toRegex(union(fromString(" \t\v\f"), unicodeCategories(['Zs'])))
  var whiteCharRE = /[\t\v-\f \u00a0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000]/;
  var layoutKeyword = /let|where|of|do/;
*/

  var smallRE = /[a-z_]/;
  var largeRE = /[A-Z]/;
  var digitsRE = /(?:[0-9])+/;
  var hexRE = /(?:[0-9A-Fa-f])+/;
  var octRE = /(?:[0-7])+/;
  var qualRE = /[a-z_A-Z0-9'\.]*\./;
  var idRE = /(?:[a-z_A-Z0-9'])*/;
  // toRegex(difference(union(fromString("!#$%&*+./<=>?@\\^|-~"), unicodeCategories(['Pc', 'Pd', 'Pe', 'Pf', 'Pi', 'Po', 'Ps', 'Sc', 'Sk', 'Sm', 'So'])), fromString("[(),;[]`{}_:\"'")))
  var symbolRE = /[!#-&*-+\--/<-@\\^|~¡-©«-¬®-±´¶-¸»¿×÷˂-˅˒-˟˥-˫˭˯-˿͵;΄-΅·϶҂՚-՟։-֊־׀׃׆׳-״؆-؏؛؞-؟٪-٭۔۩۽-۾܀-܍߶-߹।-॥॰৲-৳৺૱୰௳-௺౿ೱ-ೲ൹෴฿๏๚-๛༁-༗༚-༟༴༶༸༺-༽྅྾-࿅࿇-࿌࿎-࿔၊-၏႞-႟჻፠-፨᎐-᎙᙭-᙮᚛-᚜᛫-᛭᜵-᜶។-៖៘-៛᠀-᠊᥀᥄-᥅᧞-᧿᨞-᨟᭚-᭪᭴-᭼᰻-᰿᱾-᱿᾽᾿-῁῍-῏῝-῟῭-`´-῾‐-‧‰-⁞⁺-⁾₊-₎₠-₵℀-℁℃-℆℈-℉℔№-℘℞-℣℥℧℩℮℺-℻⅀-⅄⅊-⅍⅏←-⏧␀-␦⑀-⑊⒜-ⓩ─-⚝⚠-⚼⛀-⛃✁-✄✆-✉✌-✧✩-❋❍❏-❒❖❘-❞❡-❵➔➘-➯➱-➾⟀-⟊⟌⟐-⭌⭐-⭔⳥-⳪⳹-⳼⳾-⳿⸀-⸮⸰⺀-⺙⺛-⻳⼀-⿕⿰-⿻、-〄〈-〠〰〶-〷〽-〿゛-゜゠・㆐-㆑㆖-㆟㇀-㇣㈀-㈞㈪-㉃㉐㉠-㉿㊊-㊰㋀-㋾㌀-㏿䷀-䷿꒐-꓆꘍-꘏꙳꙾꜀-꜖꜠-꜡꞉-꞊꠨-꠫꡴-꡷꣎-꣏꤮-꤯꥟꩜-꩟﬩﴾-﴿﷼-﷽︐-︙︰-﹒﹔-﹦﹨-﹫！-／：-＠［-｀｛-･￠-￦￨-￮￼-�]|\ud800[\udd00-\udd02\udd37-\udd3f\udd79-\udd89\udd90-\udd9b\uddd0-\uddfc\udf9f\udfd0]|\ud802[\udd1f\udd3f\ude50-\ude58]|\ud809[\udc70-\udc73]|\ud834[\udc00-\udcf5\udd00-\udd26\udd29-\udd64\udd6a-\udd6c\udd83-\udd84\udd8c-\udda9\uddae-\udddd\ude00-\ude41\ude45\udf00-\udf56]|\ud835[\udec1\udedb\udefb\udf15\udf35\udf4f\udf6f\udf89\udfa9\udfc3]|\ud83c[\udc00-\udc2b\udc30-\udc93]/;
  var specialRE = /[(),;[\]`{}]/;
  var whiteCharRE = /[ \t\v\f]/;
  var layoutKeyword = /let|where|of|do/;

  function block(column, indentation) {
    return function(source, state, setState) {
      var column = source.column() + CodeMirror.countColumn(source.current(), null, source.tabSize);
      // If we're at the beginning of the next line after a block opener, then use normal mode.
      if (column == 0) {
        return switchState(source, state, setState, normal);
      // Otherwise, the position after eating whitespace determines the indent.
      // (f = do     bar), the start of bar is the start of the block.
      //TODO: handle comments etc.
      } else {
        source.eatWhile(whiteCharRE)
        if (!source.eol()) {
          // Remove the old indent.
          state.scopes.shift();
          // NOTE: need to recompute column because it might have changed due to eating whitespace.
          column = source.column() + CodeMirror.countColumn(source.current(), null, source.tabSize);
          setState(normal, state, { offset: column, isBlock: true });
        }
        return null;
      }
    };
  }

  // Returns null if the indent shouldn't be recorded.
  //
  // FIXME: For some reason selections in the middle of indents cause the nodes
  // to get split..
  function indentTag(column, isBlock, isEnd, isSuggestion) {
    if (!config.showAlignments || isSuggestion) { return false; }
    return "indent indent-" + column +
      (column % config.indentUnit == 0 ? " ontab-indent" : " offtab-indent") +
      (isBlock ? " block-indent" : " plain-indent") +
      (isEnd ? " endent" : "");
  }

  function normal(source, state, setState) {
    var column = source.column() + CodeMirror.countColumn(source.current(), null, source.tabSize);
    // Store this line's indentation if we're at the beginning.
    if (column == 0) {
      var indentation = source.indentation();
      state.indentation = indentation;
      // Remove scopes that no longer matter.
      var topScope;
      while (topScope = state.scopes.shift()) {
        if (topScope.startBlock) {
          // Found the start of a block, need to put it back on the scopes stack.
          state.scopes.unshift({ offset: indentation, isBlock: true });
          break;
        } else if (indentation >= topScope.offset) {
          // This indent should be left alone - it's at a lower / equal indent.
          state.scopes.unshift(topScope);
          break;
        }
      }
    }
    var matched = whiteCharRE.exec(source.peek());
    if (matched) {
      if (column < state.indentation) {
        for (var i = state.scopes.length - 1; i >= 0; i--) {
          // Eat whitespace till it reaches the next indentation.
          var offset = state.scopes[i].offset;
          var isBlock = state.scopes[i].isBlock;
          var isSuggestion = state.scopes[i].isSuggestion;
          while (column < offset) {
            var eaten = source.eat(whiteCharRE);
            if (!eaten) break;
            column += CodeMirror.countColumn(eaten, null, source.tabSize);
          }
          // Output an "indent" span, allowing indent guides to be styled.
          if (source.current().length > 0) {
            if (column == offset && column != 0 && whiteCharRE.test(source.peek())) {
              var result = indentTag(column, isBlock, false, isSuggestion);
              if (result) return result;
            // If we're at the end of indentation, but it's a block indent, then
            // mark that span as an indent.  We know we're at the end because if
            // the loop was able to eat enough whitespace, column == offset.
            } else if (column + 1 == offset && source.current().length > 0 && isBlock) {
              // Need to re-add the state.
              setState(normal, state, { offset: state.indentation });
              return indentTag(column, true, true, isSuggestion);
            }
          }
        }
        // Went past any indentation offset - record a plain indent.
        if (source.eatWhile(whiteCharRE) || source.current().length > 0) {
          setState(normal, state, { offset: state.indentation });
          column = source.column() + CodeMirror.countColumn(source.current(), null, source.tabSize);
          return indentTag(column, false, true, false)
        }
      }
      if (source.eatWhile(whiteCharRE)) {
        return null;
      }
    }

    //TODO: Don't indent after module header.
    if (source.match(layoutKeyword)) {
      if (source.eol() || whiteCharRE.test(source.peek())) {
        var indent = state.indentation + config.indentUnit;
        setState(block(column, indent), state, { offset: indent, startBlock: true });
        return "variable";
      } else {
        source.backUp(source.current().length);
      }
    }

    var ch = source.peek();
    if (source.eat(specialRE)) {
      if (ch == '{' && source.eat('-')) {
        var t = "comment";
        if (source.eat('#')) {
          t = "meta";
        }
        return switchState(source, state, setState, ncomment(state, t, 1));
      }
      return null;
    }

    if (source.eat('\'')) {
      if (source.eat('\\')) {
        source.next();  // should handle other escapes here
      }
      else {
        source.next();
      }
      if (source.eat('\'')) {
        return "string";
      }
      return "error";
    }

    if (source.eat('"')) {
      return switchState(source, state, setState, stringLiteral);
    }

    if (source.match(largeRE)) {
      if (source.match(qualRE)) {
        return "qualifier";
      }
      source.match(idRE);
      return "variable-2";
    }

    if (source.match(smallRE)) {
      source.match(idRE);
      return "variable";
    }

    if (source.match(digitsRE)) {
      if (ch == '0') {
        if (source.eat(/[xX]/)) {
          source.match(hexRE);
          return "number";
        }
        if (source.eat(/[oO]/)) {
          source.match(octRE);
          return "number";
        }
      }
      if (source.eat('.')) {
        source.match(digitsRE);
      }
      if (source.eat(/[eE]/)) {
        source.eat(/[-+]/);
        source.match(digitsRE);
      }
      return "number";
    }

    if (source.match(symbolRE)) {
      if (ch == '-' && source.eat(/-/)) {
        source.eatWhile(/-/);
        if (!source.match(symbolRE)) {
          source.skipToEnd();
          return "comment";
        }
      }
      var t = "operator";
      if (ch == ':') {
        t = "operator-2";
      }
      while (source.match(symbolRE)) {}
      // Auto-indent after symbols end the prior line.
      // TODO: special case out -> in types.
      // TODO: similar auto-indent for "if" blocks
      // TODO: handle trailing whitespace
      if (source.eol()) {
        setState(normal, state, { offset: state.indentation + config.indentUnit, isSuggestion: true });
      }
      return t;
    }

    source.next();
    return "error";
  }

  function ncomment(state, type, nest) {
    if (nest == 0) {
      return normal;
    }
    return function(source, state, setState) {
      var currNest = nest;
      while (!source.eol()) {
        var ch = source.next();
        if (ch == '{' && source.eat('-')) {
          ++currNest;
        }
        else if (ch == '-' && source.eat('}')) {
          --currNest;
          if (currNest == 0) {
            setState(normal, state);
            return type;
          }
        }
      }
      setState(ncomment(state, type, currNest), state);
      return type;
    };
  }

  function stringLiteral(source, state, setState) {
    while (!source.eol()) {
      var ch = source.next();
      if (ch == '"') {
        setState(normal, state);
        return "string";
      }
      if (ch == '\\') {
        if (source.eol() || source.eat(whiteCharRE)) {
          setState(stringGap, state);
          return "string";
        }
        if (source.eat('&')) {
        }
        else {
          source.next(); // should handle other escapes here
        }
      }
    }
    setState(normal, state);
    return "error";
  }

  function stringGap(source, state, setState) {
    while (source.eat(whiteCharRE)) { }
    if (source.eat('\\')) {
      return switchState(source, state, setState, stringLiteral);
    }
    source.next();
    setState(normal, state);
    return "error";
  }


  var wellKnownWords = (function() {
    var wkw = Object.create(null);
    function setType(t) {
      return function () {
        for (var i = 0; i < arguments.length; i++)
          wkw[arguments[i]] = t;
      };
    }

    setType("keyword")(
      "case", "class", "data", "default", "deriving", "do", "else", "foreign",
      "if", "import", "in", "infix", "infixl", "infixr", "instance", "let",
      "module", "newtype", "of", "then", "type", "where", "_");

    setType("keyword")(
      "\.\.", ":", "::", "=", "\\", "\"", "<-", "->", "@", "~", "=>");

    /*
    setType("builtin")(
      "!!", "$!", "$", "&&", "+", "++", "-", ".", "/", "/=", "<", "<=", "=<<",
      "==", ">", ">=", ">>", ">>=", "^", "^^", "||", "*", "**");

    setType("builtin")(
      "Bool", "Bounded", "Char", "Double", "EQ", "Either", "Enum", "Eq",
      "False", "FilePath", "Float", "Floating", "Fractional", "Functor", "GT",
      "IO", "IOError", "Int", "Integer", "Integral", "Just", "LT", "Left",
      "Maybe", "Monad", "Nothing", "Num", "Ord", "Ordering", "Rational", "Read",
      "ReadS", "Real", "RealFloat", "RealFrac", "Right", "Show", "ShowS",
      "String", "True");

    setType("builtin")(
      "abs", "acos", "acosh", "all", "and", "any", "appendFile", "asTypeOf",
      "asin", "asinh", "atan", "atan2", "atanh", "break", "catch", "ceiling",
      "compare", "concat", "concatMap", "const", "cos", "cosh", "curry",
      "cycle", "decodeFloat", "div", "divMod", "drop", "dropWhile", "either",
      "elem", "encodeFloat", "enumFrom", "enumFromThen", "enumFromThenTo",
      "enumFromTo", "error", "even", "exp", "exponent", "fail", "filter",
      "flip", "floatDigits", "floatRadix", "floatRange", "floor", "fmap",
      "foldl", "foldl1", "foldr", "foldr1", "fromEnum", "fromInteger",
      "fromIntegral", "fromRational", "fst", "gcd", "getChar", "getContents",
      "getLine", "head", "id", "init", "interact", "ioError", "isDenormalized",
      "isIEEE", "isInfinite", "isNaN", "isNegativeZero", "iterate", "last",
      "lcm", "length", "lex", "lines", "log", "logBase", "lookup", "map",
      "mapM", "mapM_", "max", "maxBound", "maximum", "maybe", "min", "minBound",
      "minimum", "mod", "negate", "not", "notElem", "null", "odd", "or",
      "otherwise", "pi", "pred", "print", "product", "properFraction",
      "putChar", "putStr", "putStrLn", "quot", "quotRem", "read", "readFile",
      "readIO", "readList", "readLn", "readParen", "reads", "readsPrec",
      "realToFrac", "recip", "rem", "repeat", "replicate", "return", "reverse",
      "round", "scaleFloat", "scanl", "scanl1", "scanr", "scanr1", "seq",
      "sequence", "sequence_", "show", "showChar", "showList", "showParen",
      "showString", "shows", "showsPrec", "significand", "signum", "sin",
      "sinh", "snd", "span", "splitAt", "sqrt", "subtract", "succ", "sum",
      "tail", "take", "takeWhile", "tan", "tanh", "toEnum", "toInteger",
      "toRational", "truncate", "uncurry", "undefined", "unlines", "until",
      "unwords", "unzip", "unzip3", "userError", "words", "writeFile", "zip",
      "zip3", "zipWith", "zipWith3");

    var override = modeConfig.overrideKeywords;
    if (override) for (var word in override) if (override.hasOwnProperty(word))
      wkw[word] = override[word];

    */

    return wkw;
  })();

  return {
    startState: function ()  { return { f: normal, scopes: [{offset: 0, type: "haskell"}] }; },
    copyState:  function (s) { return { f: s.f, scopes: s.scopes.concat([]) }; },

    token: function(stream, state) {
      //TODO: fix this callback madness.
      var t = state.f(stream, state,
        function(s, state, indent) {
          state.f = s;
          if (indent) {
            if (state.scopes.length == 0) {
              state.scopes.unshift(indent);
            } else {
              for (var i = 0; i < state.scopes.length; i++) {
                var topScope = state.scopes[i];
                if (topScope.offset <= indent.offset) {
                  var exists = topScope.offset == indent.offset;
                  if (!(exists && topScope.isBlock)) {
                    state.scopes.splice(i, exists ? 1 : 0, indent);
                  }
                  break;
                }
              }
            }
          }
        });
      var w = stream.current();
      return (w in wellKnownWords) ? wellKnownWords[w] : t;
    },

    //FIXME: If the user makes a newline right after a token where its
    // indentation is sensitive to being on the eol (e.g., operators), then it
    // won't be considered.
    indent: function(state) {
      for (var i = 0; i < state.scopes.length; i++) {
        return state.scopes[i].offset;
      }
      return CodeMirror.Pass;
    }
  };

});

CodeMirror.defineMIME("text/x-haskell", "haskell");
