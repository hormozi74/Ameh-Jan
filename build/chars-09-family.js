/* ============================================================
   نسبت‌های فامیلی — وارد همان استخر شخصیت‌ها می‌شوند.
   عمه‌جان هیچ‌وقت نمی‌پرسد «معروف یا فامیل؟»؛ خودِ سؤال‌های
   موجود (everyone / tv / world) جرم احتمال را جدا می‌کنند.

   محورهای تفکیک:
     جنسیت      m | f
     نسل        g2up g1up g0 g1dn g2dn g3dn
     سمت        pat (پدری) mat (مادری) nuc (خانه‌ی خودت) inlaw (همسر) own
     نوع        blood (نسبی) | marr (سببی)
     واسطه      via_m (از طرف عمو/دایی/برادر/پسر) | via_f (عمه/خاله/خواهر/دختر)
     خودِ بازیکن you_m | you_f   ← مادرشوهر را از مادرزن جدا می‌کند
   ============================================================ */

module.exports = [

/* ---------- نسل بابابزرگ‌ها ---------- */
'پدربزرگ پدری|بابای باباته، آقاجونِ خانواده|4|kin,ir,m,g2up,pat,blood,gparent,elder,beloved',
'مادربزرگ پدری|مامانِ باباته، بی‌بی‌جانِ خانواده|4|kin,ir,f,g2up,pat,blood,gparent,elder,beloved',
'پدربزرگ مادری|بابای مامانته|4|kin,ir,m,g2up,mat,blood,gparent,elder,beloved',
'مادربزرگ مادری|مامانِ مامانته، همونی که همیشه برات نذری می‌پزه|4|kin,ir,f,g2up,mat,blood,gparent,elder,beloved',

/* ---------- نسل پدر و مادر — نسبی ---------- */
'پدر|بابای خودت، عزیزِ دلت|4|kin,ir,alive,m,g1up,nuc,blood,parent,parent0,beloved',
'مادر|مامانِ خودت، که جاش تو بهشته|4|kin,ir,alive,f,g1up,nuc,blood,parent,parent0,beloved',
'عمو|برادرِ باباته|4|kin,ir,alive,m,g1up,pat,blood,punc,via_m',
'عمه|خواهرِ باباته — یعنی منم قربونت برم!|4|kin,ir,alive,f,g1up,pat,blood,punc,via_f,beloved',
'دایی|برادرِ مامانته|4|kin,ir,alive,m,g1up,mat,blood,punc,via_m',
'خاله|خواهرِ مامانته، مامانِ دوم|4|kin,ir,alive,f,g1up,mat,blood,punc,via_f,beloved',

/* ---------- نسل پدر و مادر — سببی ---------- */
'زن‌عمو|زنِ برادرِ باباته|3|kin,ir,alive,f,g1up,pat,marr,married_in,via_m',
'شوهرعمه|شوهرِ خواهرِ باباته|3|kin,ir,alive,m,g1up,pat,marr,married_in,via_f',
'زن‌دایی|زنِ برادرِ مامانته|3|kin,ir,alive,f,g1up,mat,marr,married_in,via_m',
'شوهرخاله|شوهرِ خواهرِ مامانته|3|kin,ir,alive,m,g1up,mat,marr,married_in,via_f',
'پدرشوهر|بابای شوهرت|3|kin,ir,alive,m,g1up,inlaw,marr,parent,you_f',
'مادرشوهر|مامانِ شوهرت — خدا به دادت برسه|4|kin,ir,alive,f,g1up,inlaw,marr,parent,you_f,controversial',
'پدرزن|بابای خانمت|3|kin,ir,alive,m,g1up,inlaw,marr,parent,you_m',
'مادرزن|مامانِ خانمت|3|kin,ir,alive,f,g1up,inlaw,marr,parent,you_m',
'ناپدری|شوهرِ مامانت، بابای خودت نیست|2|kin,ir,alive,m,g1up,nuc,marr,married_in,step,parent',
'نامادری|زنِ بابات، مامانِ خودت نیست|2|kin,ir,alive,f,g1up,nuc,marr,married_in,step,parent',

/* ---------- هم‌نسل — نسبی ---------- */
'برادر|داداشِ خودت|4|kin,ir,alive,m,g0,nuc,blood,sib,beloved',
'خواهر|آبجیِ خودت|4|kin,ir,alive,f,g0,nuc,blood,sib,beloved',
'برادر ناتنی|داداشی که فقط یه پدر یا یه مادر باهاش مشترکی|2|kin,ir,alive,m,g0,nuc,blood,sib,step',
'خواهر ناتنی|آبجی‌ای که فقط یه پدر یا یه مادر باهاش مشترکی|2|kin,ir,alive,f,g0,nuc,blood,sib,step',
'پسرعمو|پسرِ برادرِ باباته|4|kin,ir,alive,m,g0,pat,blood,cousin,via_m',
'دخترعمو|دخترِ برادرِ باباته|4|kin,ir,alive,f,g0,pat,blood,cousin,via_m',
'پسرعمه|پسرِ خواهرِ باباته|4|kin,ir,alive,m,g0,pat,blood,cousin,via_f',
'دخترعمه|دخترِ خواهرِ باباته|4|kin,ir,alive,f,g0,pat,blood,cousin,via_f',
'پسردایی|پسرِ برادرِ مامانته|4|kin,ir,alive,m,g0,mat,blood,cousin,via_m',
'دختردایی|دخترِ برادرِ مامانته|4|kin,ir,alive,f,g0,mat,blood,cousin,via_m',
'پسرخاله|پسرِ خواهرِ مامانته|4|kin,ir,alive,m,g0,mat,blood,cousin,via_f',
'دخترخاله|دخترِ خواهرِ مامانته|4|kin,ir,alive,f,g0,mat,blood,cousin,via_f',

/* ---------- هم‌نسل — سببی ---------- */
'شوهر|همسرِ خودت|4|kin,ir,alive,m,g0,own,marr,spouse,you_f,love,beloved',
'زن|همسرِ خودت|4|kin,ir,alive,f,g0,own,marr,spouse,you_m,love,beloved',
'برادرشوهر|داداشِ شوهرت|3|kin,ir,alive,m,g0,inlaw,marr,sib,you_f',
'خواهرشوهر|آبجیِ شوهرت|4|kin,ir,alive,f,g0,inlaw,marr,sib,you_f,controversial',
'برادرزن|داداشِ خانمت|3|kin,ir,alive,m,g0,inlaw,marr,sib,you_m',
'خواهرزن|آبجیِ خانمت|3|kin,ir,alive,f,g0,inlaw,marr,sib,you_m',
'باجناق|شوهرِ خواهرِ خانمت — رفیقِ عروسی‌ها|3|kin,ir,alive,m,g0,inlaw,marr,married_in,you_m,comedy',
'جاری|زنِ برادرِ شوهرت|3|kin,ir,alive,f,g0,inlaw,marr,married_in,you_f',
'زن‌برادر|زنِ داداشِ خودت|3|kin,ir,alive,f,g0,nuc,marr,married_in,sib',
'شوهرخواهر|شوهرِ آبجیِ خودت|3|kin,ir,alive,m,g0,nuc,marr,married_in,sib',
'هوو|زنِ دیگرِ شوهرت|2|kin,ir,alive,f,g0,own,marr,married_in,you_f,controversial',

/* ---------- نسل بچه‌ها ---------- */
'پسر|پسرِ خودت|4|kin,ir,alive,m,g1dn,own,blood,child,young,beloved',
'دختر|دخترِ خودت|4|kin,ir,alive,f,g1dn,own,blood,child,young,beloved',
'برادرزاده|پسرِ داداشت|4|kin,ir,alive,m,g1dn,nuc,blood,nibling,via_m,young',
'برادرزاده (دختر)|دخترِ داداشت|4|kin,ir,alive,f,g1dn,nuc,blood,nibling,via_m,young',
'خواهرزاده|پسرِ آبجیت|4|kin,ir,alive,m,g1dn,nuc,blood,nibling,via_f,young',
'خواهرزاده (دختر)|دخترِ آبجیت|4|kin,ir,alive,f,g1dn,nuc,blood,nibling,via_f,young',
'عروس|زنِ پسرت|3|kin,ir,alive,f,g1dn,own,marr,married_in,via_m',
'داماد|شوهرِ دخترت|3|kin,ir,alive,m,g1dn,own,marr,married_in,via_f',

/* ---------- نوه‌ها ---------- */
'نوه (پسر)|پسرِ بچه‌ت، نورِ چشمت|4|kin,ir,alive,m,g2dn,own,blood,gchild,young,beloved',
'نوه (دختر)|دخترِ بچه‌ت|4|kin,ir,alive,f,g2dn,own,blood,gchild,young,beloved',

/* «نتیجه» عمداً نیست: از «نوه» با هیچ سؤالی جدا نمی‌شد (۰٪ دقت) و فقط
   جرمِ احتمالِ نوه را می‌دزدید. اگر روزی سؤالِ «نوه‌ی نوه‌ته؟» اضافه شد،
   برگردانش با برچسب g3dn. */
];
