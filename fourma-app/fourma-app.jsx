import { useState, useRef, useEffect } from "react";

const C = {
  pageBg:'#D8D7D5',white:'#FFFFFF',surface:'#F2F1EF',border:'#E2E2DF',
  text1:'#111111',text2:'#555555',text3:'#9A9A97',accent:'#111111',
  green:'#3A7D44',greenBg:'#EAF4EC',amber:'#B07D2A',amberBg:'#FDF4E3',
};
const tx = (size,weight=400,color=C.text1) => ({ fontSize:size,fontWeight:weight,color,lineHeight:`${Math.round(size*1.45)}px` });

// ── Primitives ─────────────────────────────────────────────
const Wire = ({h=52,label}) => (
  <div style={{width:'100%',height:h,background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 12px',...tx(10,400,C.text3),textAlign:'center',flexShrink:0}}>{label}</div>
);
const Hr = () => <div style={{height:1,background:C.border,margin:'14px 0'}}/>;
const Stack = ({children,gap=8}) => <div style={{display:'flex',flexDirection:'column',gap}}>{children}</div>;
const HScroll = ({children}) => <div style={{overflowX:'auto',display:'flex',gap:10,paddingBottom:4}}>{children}</div>;
const Chip = ({label}) => <div style={{padding:'3px 9px',flexShrink:0,background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,...tx(9,400,C.text2),whiteSpace:'nowrap'}}>{label}</div>;
const Tag = ({label,color,bg}) => <div style={{padding:'3px 9px',borderRadius:6,flexShrink:0,background:bg||C.surface,border:`1px solid ${color||C.border}`,...tx(9,500,color||C.text2)}}>{label}</div>;
const Section = ({title,action,children,mb=16}) => (
  <div style={{marginBottom:mb}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
      <span style={tx(12,600)}>{title}</span>
      {action && <span style={tx(10,400,C.text3)}>{action} ›</span>}
    </div>
    {children}
  </div>
);
const StatBox = ({label,value,color}) => (
  <div style={{flex:1,padding:'10px 8px',textAlign:'center',background:C.surface,border:`1px solid ${C.border}`,borderRadius:10}}>
    <div style={tx(9,400,C.text3)}>{label}</div>
    <div style={{...tx(12,600,color||C.text1),marginTop:3}}>{value}</div>
  </div>
);
const TapCard = ({children,onTap,style={}}) => (
  <div onClick={onTap} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden',cursor:onTap?'pointer':'default',...style}}>{children}</div>
);
const ActionBar = ({actions}) => (
  <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'12px 20px 24px',background:C.white,borderTop:`1px solid ${C.border}`,display:'flex',gap:10}}>
    {actions.map((a,i) => <button key={i} onClick={a.onTap} style={{flex:1,height:46,background:i===0?C.white:C.accent,border:`1.5px solid ${i===0?C.border:C.accent}`,borderRadius:12,...tx(13,500,i===0?C.text1:C.white),cursor:'pointer'}}>{a.label}</button>)}
  </div>
);
const FilterRow = ({options,active,setActive}) => (
  <HScroll>
    {options.map(f => (
      <div key={f} onClick={()=>setActive(f)} style={{padding:'5px 12px',flexShrink:0,cursor:'pointer',background:active===f?C.text1:C.surface,border:`1px solid ${active===f?C.text1:C.border}`,borderRadius:20,...tx(10,active===f?500:400,active===f?C.white:C.text2),whiteSpace:'nowrap'}}>{f}</div>
    ))}
  </HScroll>
);

// ── Data ───────────────────────────────────────────────────
const LOCATIONS = {
  lech:{id:'lech',name:'Lech am Arlberg',country:'Austria',region:'Vorarlberg',market:'+3.2% YTD',avgPrice:'€8,500/m²',foreign:'Allowed',foreignOk:true,tax:'~3.5%',
    overview:'One of Europe\'s most exclusive alpine destinations. Strict building regulations preserve village character and protect long-term values. Limited supply, strong demand from European and GCC buyers.',
    rules:['EU citizens: unrestricted purchase','Non-EU: purchase via Austrian GmbH','New construction requires local authority approval','Rental restrictions apply in most zones'],
    activities:['World-class skiing','Summer hiking','Wellness & spa','Fine dining','Golf (summer)','Mountain biking'],
    properties:['prop_lech_1','prop_lech_2']},
  hokkaido:{id:'hokkaido',name:'Hokkaido',country:'Japan',region:'Northern Japan',market:'+5.1% YTD',avgPrice:'¥350K/m²',foreign:'Conditions apply',foreignOk:false,tax:'~5%',
    overview:'Japan\'s northernmost island is an emerging international second-home market. Niseko has established foreign-buyer infrastructure.',
    rules:['No restrictions on freehold ownership','Municipality registration required','Agricultural land: restricted','2024: non-resident declaration required'],
    activities:['World-class powder skiing','Onsen & ryokan','Local seafood','Summer trekking','Wildlife watching','Cycling'],
    properties:['prop_hokkaido_1']},
  tuscany:{id:'tuscany',name:'Tuscany',country:'Italy',region:'Central Italy',market:'+1.4% YTD',avgPrice:'€3,200/m²',foreign:'EU friendly',foreignOk:true,tax:'~3%',
    overview:'Timeless lifestyle destination. Italy\'s Flat Tax regime (€100K/year) attracts HNW relocations. Rural properties may qualify for renovation incentives.',
    rules:['EU citizens: fully unrestricted','Non-EU: bilateral treaty framework','Flat Tax option for new fiscal residents','Agriturismo zoning: specific rules'],
    activities:['Wine & gastronomy','Art & architecture','Countryside cycling','Thermal spas','Truffle hunting','Cooking schools'],
    properties:['prop_tuscany_1']},
};

const ACTIVITIES = {
  lech:[
    {id:'a1',cat:'Ski',name:'Ski & Snowboard lessons',desc:'Private and group lessons with certified instructors on Lech\'s world-class slopes.',tags:['All levels','Daily']},
    {id:'a2',cat:'Dining',name:'Restaurant Gasthof Post',desc:'Michelin-listed alpine restaurant. Reservations recommended. Book via Assist.',tags:['Fine dining','Dinner']},
    {id:'a3',cat:'Wellness',name:'Arlberg Wellness Spa',desc:'Full-service spa with thermal pools, sauna, and mountain-view relaxation areas.',tags:['Daily','Booking required']},
    {id:'a4',cat:'Outdoor',name:'Guided mountain hiking',desc:'Certified guides lead you through Vorarlberg\'s most scenic summer routes.',tags:['Summer','Groups ok']},
    {id:'a5',cat:'Culture',name:'Hubert Lenz Photography Museum',desc:'Iconic alpine photography exhibit. Free entry for Fourma guests.',tags:['Free','Year-round']},
    {id:'a6',cat:'Dining',name:'Hus Nr. 8',desc:'Cosy apres-ski bar and restaurant. Great local wines and cheese boards.',tags:['Apres-ski','Walk-in ok']},
  ],
  hokkaido:[
    {id:'b1',cat:'Ski',name:'Niseko United ski pass',desc:'Access to all 4 Niseko resorts with a single pass. Fourma guests get 10% discount.',tags:['All levels','Season Nov–Apr']},
    {id:'b2',cat:'Wellness',name:'Yukoro Onsen',desc:'Private and public onsen baths overlooking snow-covered mountains. Ryokan experience.',tags:['Year-round','Reservations']},
    {id:'b3',cat:'Dining',name:'Sushi Yumeya',desc:'Omakase sushi using Hokkaido\'s finest seafood. 8 seats, book well in advance.',tags:['Fine dining','Pre-book']},
    {id:'b4',cat:'Outdoor',name:'Wildlife snow trekking',desc:'Guided trekking in search of Hokkaido deer, foxes and snow cranes.',tags:['Winter','Morning only']},
  ],
  tuscany:[
    {id:'c1',cat:'Dining',name:'Osteria di Fonterutoli',desc:'Family-run estate restaurant with wine from their own vineyard. Lunch only.',tags:['Lunch','Booking req.']},
    {id:'c2',cat:'Culture',name:'Siena Duomo private tour',desc:'After-hours access to the Siena Cathedral with a private art historian guide.',tags:['Exclusive','Evening']},
    {id:'c3',cat:'Outdoor',name:'E-bike wine route',desc:'Guided e-bike tour through Chianti vineyards with tastings at 3 estates.',tags:['Half-day','Seasonal']},
    {id:'c4',cat:'Wellness',name:'Terme di Petriolo',desc:'Ancient thermal springs in the Sienese hills. Day pass includes all pools.',tags:['Year-round','Walk-in ok']},
  ],
};

const PROPERTIES = {
  prop_lech_1:{id:'prop_lech_1',name:'Chalet Arlberg',location:'Lech am Arlberg, Austria',locationId:'lech',price:'€2.1M',size:'280m²',type:'Chalet',beds:4,
    description:'A classic 1970s alpine chalet in the heart of Lech with original timber structure in excellent condition. Ski-in/ski-out access and south-facing terrace with panoramic mountain views. Strong bones, dated interior — ideal transformation candidate.',
    ownership:['Full ownership','Co-own 50%'],highlights:['Ski-in / ski-out','Mountain panorama','Renovated 2023','Private garage'],score:'9.2 / 10',
    renovationBudget:'€180–240K',renovationTimeline:'8–12 months',
    renovationBreakdown:[{label:'Structure & systems',amount:'€55K'},{label:'Interior finishes',amount:'€85K'},{label:'Furniture & styling',amount:'€60K'},{label:'Landscape & terrace',amount:'€25K'}]},
  prop_lech_2:{id:'prop_lech_2',name:'Alpine Residence',location:'Lech am Arlberg, Austria',locationId:'lech',price:'€1.8M',size:'220m²',type:'Chalet',beds:3,
    description:'A compact alpine residence steps from the village center with unrestricted pedestrian access to all main lifts. Built in the 1980s, the property retains its original layout and finishings — significant upside through a full transformation.',
    ownership:['Full ownership','Co-own 25%','Co-own 50%'],highlights:['Village center','Terrace views','Ski storage'],score:'8.7 / 10',
    renovationBudget:'€140–190K',renovationTimeline:'6–10 months',
    renovationBreakdown:[{label:'Structure & systems',amount:'€40K'},{label:'Interior finishes',amount:'€70K'},{label:'Furniture & styling',amount:'€50K'},{label:'Landscape',amount:'€15K'}]},
  prop_hokkaido_1:{id:'prop_hokkaido_1',name:'Niseko Forest Villa',location:'Niseko, Hokkaido, Japan',locationId:'hokkaido',price:'¥185M',size:'350m²',type:'Villa',beds:5,
    description:'A new-build forest villa set within Niseko\'s most sought-after ski corridor. Designed by a local architect with floor-to-ceiling glazing framing the Mt. Yotei panorama. Private onsen, heated garage, and smart home integration throughout.',
    ownership:['Full ownership'],highlights:['Private onsen','Ski access','Forest setting','Smart home'],score:'9.5 / 10',
    renovationBudget:null,renovationTimeline:null,renovationBreakdown:[]},
  prop_tuscany_1:{id:'prop_tuscany_1',name:'Fattoria Belvedere',location:'Siena hills, Tuscany, Italy',locationId:'tuscany',price:'€890K',size:'520m²',type:'Farmhouse',beds:6,
    description:'A 16th-century Tuscan farmhouse on 10 hectares of olive groves and vineyards overlooking the Sienese hills. Partially renovated in the 1990s, it retains original stone walls, terracotta floors and vaulted ceilings — a rare transformation opportunity at this scale.',
    ownership:['Full ownership'],highlights:['10ha land','Olive grove','Pool','Renovation potential'],score:'8.4 / 10',
    renovationBudget:'€320–420K',renovationTimeline:'14–18 months',
    renovationBreakdown:[{label:'Structure & restoration',amount:'€140K'},{label:'Interior finishes',amount:'€110K'},{label:'Furniture & styling',amount:'€90K'},{label:'Pool & grounds',amount:'€55K'}]},
};

const HOMES = {
  home_lech:{id:'home_lech',name:'Chalet Lech',location:'Lech am Arlberg, Austria',locationId:'lech',type:'Full ownership',nextStay:'Jul 14–21, 2026',balance:null,owners:['Alex M.'],bills:[{label:'HOA fee',amount:'€840',due:'Jul 1'}],services:['Maintenance scheduled Jul 10','Q2 tax filing due — Austria']},
  home_hokkaido:{id:'home_hokkaido',name:'Villa Hokkaido',location:'Niseko, Japan',locationId:'hokkaido',type:'Co-owned 50%',nextStay:null,balance:'18 nights',owners:['Alex M.','Partner B.'],bills:[],services:['Annual inspection due August']},
};

const STAYS = [
  {id:'s1',home:'Chalet Lech',location:'Lech, Austria',dates:'Jul 14–21, 2026',nights:7,guests:'Alex + family',status:'upcoming',homeId:'home_lech'},
  {id:'s2',home:'Kyoto Machiya',location:'Kyoto, Japan',dates:'Sep 3–6, 2026',nights:3,guests:'Alex',status:'upcoming',homeId:null,travel:true},
  {id:'s3',home:'Villa Hokkaido',location:'Niseko, Japan',dates:'Feb 10–17, 2026',nights:7,guests:'Alex + Partner B.',status:'past',homeId:'home_hokkaido'},
  {id:'s4',home:'Chalet Lech',location:'Lech, Austria',dates:'Dec 26–Jan 2, 2025',nights:8,guests:'Alex + family',status:'past',homeId:'home_lech'},
  {id:'s5',home:'Florence Apartment',location:'Florence, Italy',dates:'Oct 5–9, 2025',nights:4,guests:'Alex',status:'past',homeId:null,travel:true},
];

const TRAVEL_HOMES = [
  {id:'th1',name:'Kyoto Machiya',location:'Kyoto, Japan',type:'Traditional house',nights:3,available:true},
  {id:'th2',name:'Florence Apartment',location:'Florence, Italy',type:'Historic apartment',nights:4,available:true},
  {id:'th3',name:'Verbier Chalet',location:'Verbier, Switzerland',type:'Alpine chalet',nights:5,available:false},
  {id:'th4',name:'Bali Villa',location:'Canggu, Bali',type:'Villa',nights:4,available:true},
];

const SEARCH_PROFILES = [
  {id:'sp_alpine',icon:'🏔',name:'Alpine chalet',sub:'Austria · Switzerland',badge:'12 new',params:['Chalet / Farmhouse','Full or Co-own','€800K–2.5M'],properties:['prop_lech_1','prop_lech_2']},
  {id:'sp_japan',icon:'🌊',name:'Beach & cultural',sub:'Hokkaido, Japan',badge:'4 new',params:['Villa / House','Full ownership','¥100M–250M'],properties:['prop_hokkaido_1']},
];

// ── Onboarding ─────────────────────────────────────────────
const Onboarding = ({onNext}) => (
  <div style={{height:'100%',display:'flex',flexDirection:'column',padding:'40px 24px 28px'}}>
    <div style={{...tx(13,700),letterSpacing:'0.2em',marginBottom:28}}>⬚ FOURMA</div>
    <Wire h={190} label="[ Hero image · Lech, Austria ]"/>
    <div style={{flex:1}}/>
    <div style={{marginBottom:28}}>
      <div style={{...tx(26,300),lineHeight:'32px',marginBottom:18}}>Your private office<br/>for owning abroad</div>
      {['Discover homes that match your lifestyle','Build, own and operate from anywhere','UHNWI experience at a fraction of the cost'].map((t,i) => (
        <div key={i} style={{display:'flex',gap:8,marginBottom:7}}>
          <span style={tx(11,400,C.text3)}>—</span><span style={tx(12,400,C.text2)}>{t}</span>
        </div>
      ))}
    </div>
    <button onClick={onNext} style={{width:'100%',height:50,background:C.accent,color:C.white,border:'none',borderRadius:12,...tx(14,500,C.white),cursor:'pointer'}}>Get Started</button>
    <div style={{...tx(10,400,C.text3),textAlign:'center',marginTop:10}}>Already a member? Sign in</div>
  </div>
);

// ── Quiz ───────────────────────────────────────────────────
const QUIZ_STEPS = [
  {q:'What brings you to Fourma?',sub:'This shapes your personalised experience',opts:['Looking to buy property abroad','I already own property','Both']},
  {q:'Which lifestyle resonates with you?',sub:'Select all that apply',opts:['Mountain & ski','Beach & coast','City & culture','Countryside']},
  {q:'What ownership model interests you?',sub:"We'll find options that fit your goals",opts:['Full ownership (100%)','Co-ownership (25–50%)','Open to both']},
];
const Quiz = ({onDone}) => {
  const [step,setStep] = useState(0); const [sel,setSel] = useState({});
  const q = QUIZ_STEPS[step]; const isLast = step===QUIZ_STEPS.length-1;
  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column',padding:'40px 24px 28px'}}>
      <div style={{display:'flex',gap:5,marginBottom:28}}>
        {QUIZ_STEPS.map((_,i)=><div key={i} style={{flex:1,height:2,borderRadius:1,background:i<=step?C.text1:C.border}}/>)}
      </div>
      <div style={{...tx(10,400,C.text3),marginBottom:6,letterSpacing:'0.1em'}}>OWNERSHIP DNA · {step+1} / {QUIZ_STEPS.length}</div>
      <div style={{...tx(20,400),lineHeight:'26px',marginBottom:6}}>{q.q}</div>
      <div style={{...tx(12,400,C.text2),marginBottom:28}}>{q.sub}</div>
      <div style={{display:'flex',flexDirection:'column',gap:10,flex:1}}>
        {q.opts.map((o,i)=>{const k=`${step}-${i}`;const on=sel[k];return(
          <div key={k} onClick={()=>setSel(s=>({...s,[k]:!s[k]}))} style={{padding:'14px 18px',border:`1.5px solid ${on?C.text1:C.border}`,borderRadius:12,background:on?C.surface:C.white,...tx(13,on?500:400,on?C.text1:C.text2),cursor:'pointer'}}>{o}</div>
        );})}
      </div>
      <button onClick={isLast?onDone:()=>setStep(s=>s+1)} style={{width:'100%',height:50,background:C.accent,color:C.white,border:'none',borderRadius:12,...tx(14,500,C.white),cursor:'pointer',marginTop:24}}>
        {isLast?'Build My Feed →':'Next →'}
      </button>
    </div>
  );
};

// ═══ INNER PAGES ══════════════════════════════════════════

// ── Location Detail ────────────────────────────────────────
const LocationPage = ({data,navigate}) => {
  const loc = LOCATIONS[data.id]||LOCATIONS.lech;
  return (
    <div style={{height:'100%',position:'relative',display:'flex',flexDirection:'column'}}>
      <div style={{flex:1,overflowY:'auto',paddingBottom:88}}>
        <Wire h={210} label={`[ ${loc.name} · Hero photo ]`}/>
        <div style={{padding:'16px 20px 0'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
            <div>
              <div style={{...tx(22,300),lineHeight:'26px'}}>{loc.name}</div>
              <div style={{...tx(12,400,C.text2),marginTop:2}}>{loc.country} · {loc.region}</div>
            </div>
            <div style={{...tx(14,600),color:C.green}}>{loc.market}</div>
          </div>
          <div style={{display:'flex',gap:8,marginBottom:20}}>
            <StatBox label="Avg price" value={loc.avgPrice}/>
            <StatBox label="Foreign buyers" value={loc.foreign} color={loc.foreignOk?C.green:C.amber}/>
            <StatBox label="Transfer tax" value={loc.tax}/>
          </div>
          <Section title="Overview">
            <div style={{...tx(12,400,C.text2),lineHeight:'18px'}}>{loc.overview}</div>
          </Section>
          <Hr/>
          <Section title="Ownership Guide">
            <Stack gap={9}>
              {loc.rules.map((r,i)=>(
                <div key={i} style={{display:'flex',gap:8}}>
                  <span style={{...tx(10,400,i===0?C.green:C.text3),flexShrink:0,marginTop:1}}>{i===0?'✓':'—'}</span>
                  <span style={tx(12,400,C.text2)}>{r}</span>
                </div>
              ))}
            </Stack>
          </Section>
          <Hr/>
          <Section title={`Properties in ${loc.name}`} action="View all">
            <Stack gap={10}>
              {loc.properties.map(pid=>{
                const p=PROPERTIES[pid]; if(!p) return null;
                return(
                  <TapCard key={pid} onTap={()=>navigate('property',{id:pid})}>
                    <div style={{padding:14}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                        <span style={tx(13,500)}>{p.name}</span><span style={tx(13,600)}>{p.price}</span>
                      </div>
                      <div style={tx(11,400,C.text2)}>{p.type} · {p.size} · {p.beds} beds</div>
                      <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
                        {p.ownership.map((o,j)=><Tag key={j} label={o}/>)}
                      </div>
                      <div style={{...tx(10,400,C.text3),marginTop:8}}>Fourma score {p.score} →</div>
                    </div>
                  </TapCard>
                );
              })}
            </Stack>
          </Section>
          <Hr/>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <span style={tx(12,600)}>Activities & Lifestyle</span>
            <span onClick={()=>navigate('activities',{locationId:data.id})} style={{...tx(10,400,C.text3),cursor:'pointer'}}>Browse all ›</span>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:7,marginBottom:16}}>
            {loc.activities.map((a,i)=>(
              <div key={i} onClick={()=>navigate('activities',{locationId:data.id,prefilter:a})} style={{padding:'5px 12px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,...tx(10,400,C.text2),cursor:'pointer',flexShrink:0}}>{a}</div>
            ))}
          </div>
          <Hr/>
          <Section title="Market & Updates">
            <Stack gap={10}>
              <div style={{padding:'12px 14px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:10}}>
                <div style={{...tx(9,500,C.text3),letterSpacing:'0.08em',marginBottom:6}}>PRICE TREND</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <span style={tx(12,500)}>{loc.market} year to date</span>
                  <span style={{...tx(11,600),color:C.green}}>{loc.avgPrice}</span>
                </div>
                <Wire h={44} label="[ Price trend chart · 24 months ]"/>
              </div>
              {[
                {date:'Jun 2026',title:'Ski lift expansion confirmed for 2026–27',type:'Infrastructure'},
                {date:'May 2026',title:'Foreign ownership rules — no changes',type:'Legal'},
                {date:'Apr 2026',title:'Avg transaction price +3.2% vs Q1 2025',type:'Market'},
              ].map((u,i)=>(
                <div key={i} style={{padding:'10px 14px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:10}}>
                  <div style={{...tx(12,500),marginBottom:6}}>{u.title}</div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <Tag label={u.type}/><span style={tx(10,400,C.text3)}>{u.date}</span>
                  </div>
                </div>
              ))}
            </Stack>
          </Section>
          <Hr/>
          <Section title="Fourma Homes here">
            <Wire h={72} label="[ Travel homes available in this location ]"/>
          </Section>
        </div>
      </div>
      <ActionBar actions={[{label:'Save Location',onTap:()=>{}},{label:'Add to Profile',onTap:()=>{}}]}/>
    </div>
  );
};

// ── Activities Page ────────────────────────────────────────
const ActivitiesPage = ({data}) => {
  const locationId = data.locationId||'lech';
  const loc = LOCATIONS[locationId];
  const acts = ACTIVITIES[locationId]||[];
  const cats = ['All',...[...new Set(acts.map(a=>a.cat))]];
  const [cat,setCat] = useState(data.prefilter ? acts.find(a=>a.name===data.prefilter||a.cat===data.prefilter)?.cat||'All' : 'All');
  const filtered = cat==='All' ? acts : acts.filter(a=>a.cat===cat);
  return (
    <div style={{height:'100%',overflowY:'auto',padding:'12px 20px 96px'}}>
      <div style={{...tx(12,400,C.text2),marginBottom:14}}>{loc?.name} · {filtered.length} experiences</div>
      <FilterRow options={cats} active={cat} setActive={setCat}/>
      <div style={{height:16}}/>
      <Stack gap={12}>
        {filtered.map(a=>(
          <div key={a.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
              <div style={{flex:1}}>
                <div style={{...tx(10,600,C.text3),letterSpacing:'0.08em',marginBottom:4}}>{a.cat.toUpperCase()}</div>
                <div style={tx(13,600)}>{a.name}</div>
              </div>
            </div>
            <div style={{...tx(12,400,C.text2),lineHeight:'17px',marginBottom:10}}>{a.desc}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
              {a.tags.map((t,i)=><Chip key={i} label={t}/>)}
            </div>
            <div style={{display:'flex',gap:8}}>
              <button style={{flex:1,height:36,background:C.white,border:`1px solid ${C.border}`,borderRadius:8,...tx(11,500,C.text1),cursor:'pointer'}}>Save</button>
              <button style={{flex:2,height:36,background:C.accent,border:'none',borderRadius:8,...tx(11,500,C.white),cursor:'pointer'}}>Book via Assist →</button>
            </div>
          </div>
        ))}
      </Stack>
    </div>
  );
};

// ── Property Detail ────────────────────────────────────────
const PropertyPage = ({data,navigate}) => {
  const p=PROPERTIES[data.id]; if(!p) return null;
  const loc=LOCATIONS[p.locationId];
  const [view,setView] = useState('asis');
  const [style,setStyle] = useState(0);
  const styles = ['Alpine Modern','Mediterranean','Minimalist'];

  return (
    <div style={{height:'100%',position:'relative',display:'flex',flexDirection:'column'}}>
      <div style={{flex:1,overflowY:'auto',paddingBottom:88}}>

        {/* Photo area with As Is / To Be toggle */}
        <div style={{position:'relative'}}>
          <Wire h={220} label={view==='asis' ? `[ ${p.name} · Current photos ]` : `[ AI render · ${styles[style]} concept ]`}/>
          {/* Toggle pill */}
          <div style={{position:'absolute',bottom:12,left:'50%',transform:'translateX(-50%)',display:'flex',background:'rgba(0,0,0,0.55)',borderRadius:20,padding:3,gap:2}}>
            {[['asis','As Is'],['tobe','To Be']].map(([v,label])=>(
              <div key={v} onClick={()=>setView(v)} style={{padding:'5px 14px',borderRadius:16,background:view===v?C.white:'transparent',cursor:'pointer',...tx(10,view===v?600:400,view===v?C.text1:'rgba(255,255,255,0.8)')}}>
                {label}
              </div>
            ))}
          </div>
          {/* To Be: style selector */}
          {view==='tobe' && (
            <div style={{position:'absolute',top:12,right:12,display:'flex',flexDirection:'column',gap:6}}>
              {styles.map((s,i)=>(
                <div key={i} onClick={()=>setStyle(i)} style={{width:52,height:36,background:style===i?C.white:' rgba(255,255,255,0.6)',borderRadius:6,border:`2px solid ${style===i?C.text1:'transparent'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                  <span style={tx(8,style===i?600:400,C.text1)}>{s.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{padding:'16px 20px 0'}}>
          {/* Title + price */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
            <div>
              <div style={{...tx(20,400),lineHeight:'24px'}}>{p.name}</div>
              <div style={{...tx(12,400,C.text2),marginTop:2}}>{p.location}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={tx(18,600)}>{p.price}</div>
              <div style={tx(10,400,C.text3)}>full ownership</div>
            </div>
          </div>

          {/* Description */}
          <div style={{...tx(12,400,C.text2),lineHeight:'18px',marginBottom:14}}>{p.description}</div>

          <div style={{display:'flex',gap:8,marginBottom:20}}>
            <StatBox label="Size" value={p.size}/><StatBox label="Type" value={p.type}/><StatBox label="Beds" value={`${p.beds} beds`}/>
          </div>

          <Section title="Highlights">
            <div style={{display:'flex',flexWrap:'wrap',gap:7}}>{p.highlights.map((h,i)=><Chip key={i} label={h}/>)}</div>
          </Section>
          <Hr/>

          {/* Transformation section — only for properties with renovation potential */}
          {p.renovationBudget && (
            <>
              <Section title="Transformation Potential">
                <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden'}}>
                  <div style={{display:'flex',gap:1}}>
                    <div style={{flex:1,height:80,background:C.border,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <span style={tx(9,400,C.text3)}>Before</span>
                    </div>
                    <div style={{flex:1,height:80,background:'#D8D4CE',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <span style={tx(9,400,C.text3)}>After · AI render</span>
                    </div>
                  </div>
                  <div style={{padding:'12px 14px'}}>
                    <div style={{...tx(9,500,C.text3),letterSpacing:'0.08em',marginBottom:10}}>PRELIMINARY CONCEPT · FOURMA ESTIMATE</div>
                    <div style={{marginBottom:12}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                        <span style={tx(12,600)}>Estimated budget</span>
                        <span style={tx(13,700)}>{p.renovationBudget}</span>
                      </div>
                      <Stack gap={5}>
                        {p.renovationBreakdown.map((b,i)=>(
                          <div key={i} style={{display:'flex',justifyContent:'space-between'}}>
                            <span style={tx(11,400,C.text2)}>{b.label}</span>
                            <span style={tx(11,500)}>{b.amount}</span>
                          </div>
                        ))}
                      </Stack>
                    </div>
                    <div style={{display:'flex',gap:8,marginBottom:12}}>
                      <StatBox label="Timeline" value={p.renovationTimeline}/>
                      <StatBox label="Managed by" value="Fourma"/>
                    </div>
                    <button onClick={()=>setView('tobe')} style={{width:'100%',height:38,background:C.accent,border:'none',borderRadius:8,...tx(12,500,C.white),cursor:'pointer'}}>
                      Explore transformation →
                    </button>
                  </div>
                </div>
              </Section>
              <Hr/>
            </>
          )}

          <Section title="Ownership Options">
            <Stack gap={8}>
              {p.ownership.map((o,i)=>(
                <div key={i} style={{padding:'12px 14px',background:C.surface,border:`1.5px solid ${i===0?C.text1:C.border}`,borderRadius:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={tx(12,i===0?600:400)}>{o}</div>
                    <div style={{...tx(10,400,C.text3),marginTop:2}}>{i===0?p.price+' full':o.includes('25%')?'~25% of price':'~50% of price'}</div>
                  </div>
                  {i===0 && <Tag label="Recommended" color={C.green} bg={C.greenBg}/>}
                </div>
              ))}
            </Stack>
          </Section>
          <Hr/>

          <Section title="Fourma Analysis">
            <div style={{padding:'12px 14px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:10}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                <span style={tx(12,600)}>Fourma Score</span>
                <span style={{...tx(16,700),color:C.green}}>{p.score}</span>
              </div>
              <Wire h={44} label="[ AI: rental yield · appreciation · lifestyle fit ]"/>
            </div>
          </Section>
          <Hr/>

          {loc && (
            <Section title="Location">
              <TapCard onTap={()=>navigate('location',{id:p.locationId})}>
                <div style={{padding:'12px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div><div style={tx(12,500)}>{loc.name}</div><div style={{...tx(10,400,C.text3),marginTop:2}}>{loc.country} · {loc.market}</div></div>
                  <span style={tx(11,400,C.text3)}>Full guide ›</span>
                </div>
              </TapCard>
            </Section>
          )}
        </div>
      </div>
      <ActionBar actions={[{label:'♡  Save',onTap:()=>{}},{label:'Start Inquiry',onTap:()=>{}}]}/>
    </div>
  );
};

// ── Stays Page ─────────────────────────────────────────────
// ── Project Data ────────────────────────────────────────────
const PROJECTS = [
  {id:'proj_1',type:'renovation',name:'Villa Hokkaido · Renovation',location:'Niseko, Japan',status:'Planning',phase:'Design & permits',progress:1,budget:'¥18M',icon:'🔨'},
];

const PAGANO_HOMES = [
  {id:'p1',name:'Pagano Casa 180',size:'180m²',beds:3,style:'Contemporary Alpine',time:'8 months',price:'€320K',img:'Contemporary prefab'},
  {id:'p2',name:'Pagano Casa 240',size:'240m²',beds:4,style:'Mediterranean Modern',time:'10 months',price:'€420K',img:'Mediterranean prefab'},
  {id:'p3',name:'Pagano Villa 320',size:'320m²',beds:5,style:'Minimalist',time:'12 months',price:'€580K',img:'Minimalist prefab'},
];

// ── Project Intake Wizard ────────────────────────────────────
const PROJECT_STEPS = [
  {
    q:'What do you have?',
    sub:'Tell us about your starting point',
    opts:[
      {icon:'🌿',label:'Land plot',sub:'I own land and want to build'},
      {icon:'🏠',label:'Existing home',sub:'I own a property abroad'},
      {icon:'🤝',label:'Not sure yet',sub:'I want to explore options'},
    ]
  },
  {
    q:'What would you like to do?',
    sub:'We\'ll design the right path for you',
    optsFor:{
      'Land plot':[
        {icon:'🏗',label:'Build a new home',sub:'From design to handover'},
        {icon:'📐',label:'Custom architecture',sub:'Work with our architects'},
        {icon:'⚡',label:'Prefab by Pagano',sub:'Fast track · 8–12 months'},
      ],
      'Existing home':[
        {icon:'✨',label:'Renovation & styling',sub:'Transform and upgrade'},
        {icon:'🏡',label:'Join Fourma Homes',sub:'Renovate and list in our network'},
        {icon:'💰',label:'Sell a 75% stake',sub:'Monetise while keeping access'},
      ],
      'Not sure yet':[
        {icon:'📋',label:'Advisory session',sub:'Talk to our team first'},
      ],
    }
  },
  {
    q:'Where is the property?',
    sub:'Ownership rules and costs vary by country',
    opts:[
      {icon:'🇦🇹',label:'Austria'},
      {icon:'🇯🇵',label:'Japan'},
      {icon:'🇮🇹',label:'Italy'},
      {icon:'🇨🇭',label:'Switzerland'},
      {icon:'🇦🇪',label:'UAE'},
      {icon:'🌍',label:'Other'},
    ]
  },
];

const ProjectIntakePage = ({data}) => {
  const [step,setStep] = useState(0);
  const [answers,setAnswers] = useState({});
  const current = PROJECT_STEPS[step];
  const isLast = step === PROJECT_STEPS.length - 1;

  const opts = current.optsFor
    ? (current.optsFor[answers[0]] || current.optsFor['Not sure yet'])
    : current.opts;

  const select = (val) => {
    const next = {...answers, [step]: val};
    setAnswers(next);
    if (!isLast) setStep(s => s+1);
  };

  if (isLast && answers[2]) {
    // Summary screen
    const typeLabel = answers[0]==='Land plot' ? 'Build project' : answers[0]==='Existing home' ? 'Property project' : 'Advisory';
    return (
      <div style={{height:'100%',display:'flex',flexDirection:'column',padding:'32px 24px 28px'}}>
        <div style={{flex:1}}>
          <div style={{...tx(10,500,C.text3),letterSpacing:'0.1em',marginBottom:16}}>YOUR PROJECT SUMMARY</div>
          <div style={{...tx(22,300),lineHeight:'28px',marginBottom:24}}>Here's what<br/>we'll do together</div>
          <Stack gap={10}>
            {[
              ['Type', answers[0]],
              ['Goal', answers[1]],
              ['Location', answers[2]],
            ].map(([label,val],i) => (
              <div key={i} style={{padding:'12px 16px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,display:'flex',justifyContent:'space-between'}}>
                <span style={tx(11,400,C.text3)}>{label}</span>
                <span style={tx(12,500)}>{val}</span>
              </div>
            ))}
          </Stack>
          <div style={{marginTop:20,padding:'16px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:12}}>
            <div style={tx(12,600)}>Next step</div>
            <div style={{...tx(12,400,C.text2),marginTop:6,lineHeight:'18px'}}>
              {answers[1]==='Prefab by Pagano'
                ? 'Browse Pagano catalog and select your model. Our team will handle planning, permits, and build coordination.'
                : answers[1]==='Sell a 75% stake'
                ? 'An advisor will run a valuation and prepare a co-ownership structure proposal within 5 business days.'
                : answers[1]==='Join Fourma Homes'
                ? 'We\'ll assess your property against Fourma standards and propose a renovation scope and partnership terms.'
                : 'Book a 30-minute advisory call. Our team will review your situation and outline a project plan.'}
            </div>
          </div>
        </div>
        <Stack gap={10}>
          <button style={{width:'100%',height:50,background:C.accent,color:C.white,border:'none',borderRadius:12,...tx(14,500,C.white),cursor:'pointer'}}>
            {answers[1]==='Prefab by Pagano' ? 'Browse Pagano catalog →' : 'Book advisory session →'}
          </button>
          <button onClick={()=>{setStep(0);setAnswers({});}} style={{width:'100%',height:44,background:'transparent',color:C.text2,border:`1px solid ${C.border}`,borderRadius:12,...tx(13,400),cursor:'pointer'}}>
            Start over
          </button>
        </Stack>
      </div>
    );
  }

  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column',padding:'40px 24px 28px'}}>
      <div style={{display:'flex',gap:5,marginBottom:28}}>
        {PROJECT_STEPS.map((_,i) => <div key={i} style={{flex:1,height:2,borderRadius:1,background:i<=step?C.text1:C.border}}/>)}
      </div>
      <div style={{...tx(10,400,C.text3),marginBottom:6,letterSpacing:'0.1em'}}>NEW PROJECT · {step+1} / {PROJECT_STEPS.length}</div>
      <div style={{...tx(20,400),lineHeight:'26px',marginBottom:6}}>{current.q}</div>
      <div style={{...tx(12,400,C.text2),marginBottom:28}}>{current.sub}</div>
      <div style={{display:'flex',flexDirection:'column',gap:10,flex:1}}>
        {opts.map((o,i) => (
          <div key={i} onClick={()=>select(o.label)} style={{padding:'14px 18px',border:`1.5px solid ${answers[step]===o.label?C.text1:C.border}`,borderRadius:12,background:answers[step]===o.label?C.surface:C.white,cursor:'pointer',display:'flex',alignItems:'center',gap:14}}>
            <span style={{fontSize:22,flexShrink:0}}>{o.icon}</span>
            <div>
              <div style={tx(13,500)}>{o.label}</div>
              {o.sub && <div style={{...tx(11,400,C.text3),marginTop:2}}>{o.sub}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Project Detail Page ──────────────────────────────────────
const ProjectDetailPage = ({data}) => {
  const proj = PROJECTS.find(p=>p.id===data.id) || PROJECTS[0];
  const isBuild = data.type==='build';
  const [paganoView,setPaganoView] = useState(false);

  if (paganoView) {
    return (
      <div style={{height:'100%',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'12px 20px',borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <button onClick={()=>setPaganoView(false)} style={{background:'none',border:'none',cursor:'pointer',padding:0,...tx(12,400,C.text2)}}>← Back</button>
            <span style={tx(12,600)}>Pagano Collection</span>
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'16px 20px 96px'}}>
          <div style={{...tx(12,400,C.text2),marginBottom:16,lineHeight:'18px'}}>
            Pagano is a family-run Italian factory producing premium prefabricated homes since 1974. Fourma partners exclusively with Pagano for fast-track builds in our network markets.
          </div>
          <Stack gap={14}>
            {PAGANO_HOMES.map((h,i)=>(
              <div key={i} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden'}}>
                <div style={{height:140,background:C.border,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={tx(10,400,C.text3)}>[ {h.img} · render ]</span>
                </div>
                <div style={{padding:'12px 14px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={tx(13,600)}>{h.name}</span>
                    <span style={tx(13,600)}>{h.price}</span>
                  </div>
                  <div style={{...tx(11,400,C.text2),marginBottom:10}}>{h.style} · {h.size} · {h.beds} beds</div>
                  <div style={{display:'flex',gap:8,marginBottom:12}}>
                    <StatBox label="Build time" value={h.time}/>
                    <StatBox label="Size" value={h.size}/>
                    <StatBox label="Beds" value={`${h.beds} beds`}/>
                  </div>
                  <button style={{width:'100%',height:38,background:C.accent,border:'none',borderRadius:8,...tx(12,500,C.white),cursor:'pointer'}}>
                    Select this model →
                  </button>
                </div>
              </div>
            ))}
          </Stack>
        </div>
      </div>
    );
  }

  return (
    <div style={{height:'100%',overflowY:'auto',padding:'16px 20px 96px'}}>
      {isBuild ? (
        <>
          <div style={{marginBottom:20}}>
            <div style={tx(18,400)}>Land plot · Austria</div>
            <div style={{...tx(12,400,C.text2),marginTop:2}}>Lech am Arlberg · 800m² · Build project</div>
            <div style={{display:'flex',gap:6,marginTop:8}}>
              <Tag label="Planning" color={C.amber} bg={C.amberBg}/>
              <Tag label="Prefab · Pagano"/>
            </div>
          </div>

          <Section title="Project Phases">
            <Stack gap={6}>
              {[
                {label:'Land assessment & zoning',status:'done'},
                {label:'Select build model',status:'active'},
                {label:'Permits & approvals',status:'pending'},
                {label:'Factory production',status:'pending'},
                {label:'Site preparation',status:'pending'},
                {label:'Installation & handover',status:'pending'},
              ].map((ph,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:ph.status==='active'?C.amberBg:ph.status==='done'?C.greenBg:C.surface,border:`1px solid ${ph.status==='active'?C.amber:ph.status==='done'?C.green:C.border}`,borderRadius:10}}>
                  <span style={tx(13,400,ph.status==='done'?C.green:ph.status==='active'?C.amber:C.text3)}>
                    {ph.status==='done'?'✓':ph.status==='active'?'●':'○'}
                  </span>
                  <span style={tx(12,ph.status==='active'?600:400,ph.status==='pending'?C.text3:C.text1)}>{ph.label}</span>
                  {ph.status==='active' && <span style={{...tx(10,500,C.amber),marginLeft:'auto'}}>Now</span>}
                </div>
              ))}
            </Stack>
          </Section>
          <Hr/>

          <Section title="Pagano Collection">
            <div style={{padding:'12px 14px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <div>
                  <div style={tx(12,600)}>Pagano · Fourma partner</div>
                  <div style={{...tx(10,400,C.text3),marginTop:1}}>Italian prefab · 50 years experience · 3 models available</div>
                </div>
                <div style={{width:36,height:36,background:C.border,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={tx(16)}>🇮🇹</span>
                </div>
              </div>
              <div style={{...tx(11,400,C.text2),lineHeight:'16px',marginBottom:12}}>
                Premium prefabricated homes built in Italy, delivered and installed on your plot. Fixed price, fixed timeline, Fourma-standard finishes.
              </div>
              <button onClick={()=>setPaganoView(true)} style={{width:'100%',height:40,background:C.accent,border:'none',borderRadius:8,...tx(12,500,C.white),cursor:'pointer'}}>
                Browse Pagano models →
              </button>
            </div>
            <div style={{padding:'10px 14px',border:`1.5px dashed ${C.border}`,borderRadius:10,...tx(11,400,C.text2),textAlign:'center'}}>
              Or start with custom architecture →
            </div>
          </Section>
          <Hr/>

          <Section title="Your Advisor">
            <Wire h={64} label="[ Marco R. · Development & Construction · Message / Call ]"/>
          </Section>
        </>
      ) : (
        <>
          {/* Renovation / Join Fourma Homes / Sell stake project */}
          <div style={{marginBottom:20}}>
            <div style={tx(18,400)}>{proj.name}</div>
            <div style={{...tx(12,400,C.text2),marginTop:2}}>{proj.location}</div>
            <div style={{display:'flex',gap:6,marginTop:8}}>
              <Tag label={proj.status} color={C.amber} bg={C.amberBg}/>
              <Tag label={proj.type==='renovation'?'Renovation':'Ownership restructuring'}/>
            </div>
          </div>

          {proj.type==='renovation' && (
            <>
              <Section title="Project Phases">
                <Stack gap={6}>
                  {['Property assessment','Design & concept','Permits','Construction','Styling & furnishing','Fourma Homes onboarding'].map((ph,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:i===1?C.amberBg:i<1?C.greenBg:C.surface,border:`1px solid ${i===1?C.amber:i<1?C.green:C.border}`,borderRadius:10}}>
                      <span style={tx(13,400,i<1?C.green:i===1?C.amber:C.text3)}>{i<1?'✓':i===1?'●':'○'}</span>
                      <span style={tx(12,i===1?600:400,i>1?C.text3:C.text1)}>{ph}</span>
                      {i===1 && <span style={{...tx(10,500,C.amber),marginLeft:'auto'}}>Now</span>}
                    </div>
                  ))}
                </Stack>
              </Section>
              <Hr/>
              <Section title="Budget">
                <Wire h={80} label={`[ ${proj.budget} · Renovation estimate · Breakdown ]`}/>
              </Section>
              <Hr/>
              <Section title="Fourma Homes Partnership">
                <div style={{padding:'12px 14px',background:C.greenBg,border:`1px solid ${C.green}`,borderRadius:10}}>
                  <div style={tx(12,600)}>Upon completion</div>
                  <div style={{...tx(11,400,C.text2),marginTop:4,lineHeight:'16px'}}>Your property joins Fourma Homes network. You earn rental income from vetted Fourma members and access 18+ nights of travel balance across the network.</div>
                </div>
              </Section>
            </>
          )}
        </>
      )}
    </div>
  );
};

const StaysPage = ({navigate}) => {
  const [tab,setTab] = useState('Upcoming');
  const upcoming = STAYS.filter(s=>s.status==='upcoming');
  const past = STAYS.filter(s=>s.status==='past');
  const shown = tab==='Upcoming' ? upcoming : past;
  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'10px 20px',borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:'flex',background:C.surface,borderRadius:10,padding:3,border:`1px solid ${C.border}`}}>
          {['Upcoming','Past'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:'7px 0',background:tab===t?C.white:'transparent',border:tab===t?`1px solid ${C.border}`:'1px solid transparent',borderRadius:7,...tx(11,tab===t?600:400,tab===t?C.text1:C.text3),cursor:'pointer'}}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'14px 20px 96px'}}>
        {shown.length===0 ? (
          <div style={{padding:24,border:`1.5px dashed ${C.border}`,borderRadius:12,...tx(12,400,C.text3),textAlign:'center'}}>No {tab.toLowerCase()} stays</div>
        ) : (
          <Stack gap={10}>
            {shown.map(s=>(
              <div key={s.id} onClick={s.homeId?()=>navigate('home',{id:s.homeId}):undefined}
                style={{padding:14,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,cursor:s.homeId?'pointer':'default'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                  <div>
                    <div style={tx(13,500)}>{s.home}</div>
                    <div style={{...tx(10,400,C.text3),marginTop:1}}>{s.location}</div>
                  </div>
                  {s.travel && <Tag label="Travel" color={C.green} bg={C.greenBg}/>}
                </div>
                <div style={{display:'flex',gap:12,marginTop:8}}>
                  <div><div style={tx(9,400,C.text3)}>Dates</div><div style={tx(11,500)}>{s.dates}</div></div>
                  <div><div style={tx(9,400,C.text3)}>Nights</div><div style={tx(11,500)}>{s.nights}</div></div>
                  <div><div style={tx(9,400,C.text3)}>Guests</div><div style={tx(11,500)}>{s.guests}</div></div>
                </div>
                {s.homeId && <div style={{...tx(10,400,C.text3),marginTop:8}}>View home details →</div>}
              </div>
            ))}
          </Stack>
        )}
      </div>
    </div>
  );
};

// ── Home Detail ────────────────────────────────────────────
const HomeDetailPage = ({data,navigate}) => {
  const home=HOMES[data.id]; if(!home) return null;
  return (
    <div style={{height:'100%',position:'relative',display:'flex',flexDirection:'column'}}>
      <div style={{flex:1,overflowY:'auto',paddingBottom:88}}>
        <Wire h={200} label={`[ ${home.name} · Photo ]`}/>
        <div style={{padding:'16px 20px 0'}}>
          <div style={{marginBottom:16}}>
            <div style={tx(20,400)}>{home.name}</div>
            <div style={{...tx(12,400,C.text2),marginTop:2}}>{home.location}</div>
            <div style={{display:'flex',gap:6,marginTop:6}}>
              <Tag label={home.type}/>
              {home.balance && <Tag label={`${home.balance} available`} color={C.green} bg={C.greenBg}/>}
            </div>
          </div>
          <div style={{display:'flex',gap:8,marginBottom:20}}>
            {[['📅','Book Stay'],['💬','Concierge'],['📋','Documents']].map(([icon,label],i)=>(
              <div key={i} style={{flex:1,padding:'10px 4px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,textAlign:'center',cursor:'pointer'}}>
                <div style={{fontSize:18,marginBottom:3}}>{icon}</div>
                <div style={tx(10,500)}>{label}</div>
              </div>
            ))}
          </div>
          <Section title="Upcoming Stays" action="All stays" >
            {home.nextStay?(
              <div style={{padding:'12px 14px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:10}}>
                <div style={tx(12,500)}>{home.nextStay}</div>
                <div style={{...tx(11,400,C.text2),marginTop:2}}>Alex + family · Check-in details →</div>
              </div>
            ):(
              <div style={{padding:14,border:`1.5px dashed ${C.border}`,borderRadius:10,...tx(12,400,C.text3),textAlign:'center'}}>No upcoming stays · Ask Assist to book</div>
            )}
          </Section>
          <Hr/>
          <Section title="Stay Calendar" action="Full view">
            <Wire h={110} label="[ Calendar · July–August 2026 ]"/>
          </Section>
          <Hr/>
          {home.bills.length>0 && (<>
            <Section title="Pending Bills">
              {home.bills.map((b,i)=>(
                <div key={i} style={{padding:'12px 14px',background:C.amberBg,border:`1px solid ${C.amber}`,borderRadius:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div><div style={tx(12,500)}>{b.label}</div><div style={{...tx(10,400,C.amber),marginTop:2}}>Due {b.due}</div></div>
                  <div style={tx(14,600)}>{b.amount}</div>
                </div>
              ))}
            </Section>
            <Hr/>
          </>)}
          <Section title="Home Services">
            <Stack>{home.services.map((s,i)=><Wire key={i} h={44} label={`[ ${s} ]`}/>)}</Stack>
          </Section>
          <Hr/>
          {home.locationId && (
            <Section title="Nearby Activities">
              <TapCard onTap={()=>navigate('activities',{locationId:home.locationId})}>
                <div style={{padding:'12px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={tx(12,500)}>Activities in {LOCATIONS[home.locationId]?.name}</div>
                    <div style={{...tx(10,400,C.text3),marginTop:2}}>{(ACTIVITIES[home.locationId]||[]).length} experiences available</div>
                  </div>
                  <span style={tx(11,400,C.text3)}>Browse ›</span>
                </div>
              </TapCard>
            </Section>
          )}
        </div>
      </div>
      <ActionBar actions={[{label:'Book Stay',onTap:()=>{}},{label:'Message Concierge',onTap:()=>{}}]}/>
    </div>
  );
};

// ── Deal Page ──────────────────────────────────────────────
const DealPage = ({data}) => {
  const prop=PROPERTIES[data.propId]||PROPERTIES.prop_tuscany_1;
  const steps=['Search','Offer accepted','Due diligence','Closing','Ownership']; const curr=2;
  return (
    <div style={{height:'100%',overflowY:'auto',padding:'16px 20px 96px'}}>
      <Wire h={160} label={`[ ${prop.name} · Photo ]`}/>
      <div style={{marginTop:16,marginBottom:20}}>
        <div style={tx(18,400)}>{prop.name}</div>
        <div style={{...tx(12,400,C.text2),marginTop:2}}>{prop.location}</div>
        <div style={{...tx(13,600),marginTop:6}}>{prop.price}</div>
      </div>
      <Section title="Deal Progress">
        <Stack gap={6}>
          {steps.map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:i===curr?C.amberBg:i<curr?C.greenBg:C.surface,border:`1px solid ${i===curr?C.amber:i<curr?C.green:C.border}`,borderRadius:10}}>
              <span style={tx(13,400,i<curr?C.green:i===curr?C.amber:C.text3)}>{i<curr?'✓':i===curr?'●':'○'}</span>
              <span style={tx(12,i===curr?600:400,i<curr?C.green:i===curr?C.amber:C.text3)}>{s}</span>
              {i===curr && <span style={{...tx(10,500,C.amber),marginLeft:'auto'}}>In progress</span>}
            </div>
          ))}
        </Stack>
      </Section>
      <Hr/>
      <Section title="Documents">
        <Stack>
          <Wire h={48} label="[ ✓  Title deed · Verified ]"/>
          <Wire h={48} label="[ ✗  Building permits · Pending ]"/>
          <Wire h={48} label="[ ✗  Tax clearance · Pending ]"/>
        </Stack>
      </Section>
      <Hr/>
      <Section title="Your Advisor"><Wire h={64} label="[ Marco R. · Real Estate Advisory · Message / Call ]"/></Section>
    </div>
  );
};

// ── Profile Feed ───────────────────────────────────────────
const ProfileFeedPage = ({data,navigate}) => {
  const profile=SEARCH_PROFILES.find(p=>p.id===data.id)||SEARCH_PROFILES[0];
  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'10px 20px',background:C.surface,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {profile.params.map((p,i)=><Chip key={i} label={p}/>)}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'14px 20px 96px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <span style={tx(12,600)}>{profile.properties.length+8} properties</span>
          <span style={tx(10,400,C.text3)}>Sort: Best match ›</span>
        </div>
        <Stack gap={12}>
          {profile.properties.map(pid=>{
            const p=PROPERTIES[pid]; if(!p) return null;
            return(
              <TapCard key={pid} onTap={()=>navigate('property',{id:pid})}>
                <Wire h={140} label={`[ ${p.name} · Photo ]`}/>
                <div style={{padding:'12px 14px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={tx(13,600)}>{p.name}</span><span style={tx(13,600)}>{p.price}</span>
                  </div>
                  <div style={tx(11,400,C.text2)}>{p.location} · {p.size}</div>
                  <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
                    {p.highlights.slice(0,2).map((h,i)=><Chip key={i} label={h}/>)}
                    <Tag label={`Score ${p.score}`} color={C.green} bg={C.greenBg}/>
                  </div>
                </div>
              </TapCard>
            );
          })}
          {[1,2,3].map(i=>(
            <TapCard key={`w${i}`}>
              <Wire h={140} label="[ Property photo ]"/>
              <div style={{padding:'12px 14px'}}><Wire h={56} label="[ Property details · Price · Highlights ]"/></div>
            </TapCard>
          ))}
        </Stack>
      </div>
    </div>
  );
};

// ── Profile Editor ─────────────────────────────────────────
const ProfileEditorPage = ({data}) => {
  const existing = data.id ? SEARCH_PROFILES.find(p=>p.id===data.id) : null;
  const [name,setName] = useState(existing?.name||'');
  const [icon,setIcon] = useState(existing?.icon||'🏔');
  const [locs,setLocs] = useState([]);
  const [types,setTypes] = useState([]);
  const [own,setOwn] = useState('');
  const [musts,setMusts] = useState([]);

  const toggle = (arr,setArr,val) => setArr(a=>a.includes(val)?a.filter(x=>x!==val):[...a,val]);

  const ICONS=['🏔','🌊','🏙','🌾','🏝','🌲'];
  const LOC_OPTS=['Austria','Switzerland','Japan','Italy','France','Spain','UAE','Canada'];
  const TYPE_OPTS=['Chalet','Villa','Apartment','Farmhouse','Land plot'];
  const OWN_OPTS=['Full ownership (100%)','Co-ownership (50%)','Co-ownership (25%)','Open to all'];
  const MUST_OPTS=['Ski access','Sea view','Pool','Garden','Mountain view','Private onsen','Garage','Smart home','Guest house'];

  return (
    <div style={{height:'100%',position:'relative',display:'flex',flexDirection:'column'}}>
      <div style={{flex:1,overflowY:'auto',padding:'16px 20px 88px'}}>

        <Section title="Icon & Name">
          <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
            {ICONS.map(ic=>(
              <div key={ic} onClick={()=>setIcon(ic)} style={{width:44,height:44,borderRadius:22,background:icon===ic?C.text1:C.surface,border:`1.5px solid ${icon===ic?C.text1:C.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,cursor:'pointer',flexShrink:0}}>{ic}</div>
            ))}
          </div>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Profile name (e.g. Alpine chalet)"
            style={{width:'100%',height:44,border:`1px solid ${C.border}`,borderRadius:10,padding:'0 14px',...tx(13,400,C.text1),outline:'none',background:C.surface,boxSizing:'border-box'}}/>
        </Section>

        <Hr/>

        <Section title="Target Locations">
          <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
            {LOC_OPTS.map(l=>{const on=locs.includes(l);return(
              <div key={l} onClick={()=>toggle(locs,setLocs,l)} style={{padding:'6px 14px',background:on?C.text1:C.surface,border:`1px solid ${on?C.text1:C.border}`,borderRadius:20,cursor:'pointer',...tx(11,on?500:400,on?C.white:C.text2)}}>{l}</div>
            );})}
          </div>
        </Section>

        <Hr/>

        <Section title="Property Type">
          <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
            {TYPE_OPTS.map(t=>{const on=types.includes(t);return(
              <div key={t} onClick={()=>toggle(types,setTypes,t)} style={{padding:'6px 14px',background:on?C.text1:C.surface,border:`1px solid ${on?C.text1:C.border}`,borderRadius:20,cursor:'pointer',...tx(11,on?500:400,on?C.white:C.text2)}}>{t}</div>
            );})}
          </div>
        </Section>

        <Hr/>

        <Section title="Ownership Model">
          <Stack gap={8}>
            {OWN_OPTS.map(o=>(
              <div key={o} onClick={()=>setOwn(o)} style={{padding:'12px 14px',background:C.surface,border:`1.5px solid ${own===o?C.text1:C.border}`,borderRadius:10,display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}>
                <span style={tx(12,own===o?600:400)}>{o}</span>
                {own===o && <span style={tx(14,400,C.text1)}>✓</span>}
              </div>
            ))}
          </Stack>
        </Section>

        <Hr/>

        <Section title="Budget Range">
          <Wire h={56} label="[ Budget range slider · €500K — €5M ]"/>
        </Section>

        <Hr/>

        <Section title="Must-Haves">
          <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
            {MUST_OPTS.map(m=>{const on=musts.includes(m);return(
              <div key={m} onClick={()=>toggle(musts,setMusts,m)} style={{padding:'6px 12px',background:on?C.text1:C.surface,border:`1px solid ${on?C.text1:C.border}`,borderRadius:20,cursor:'pointer',...tx(10,on?500:400,on?C.white:C.text2)}}>{m}</div>
            );})}
          </div>
        </Section>

      </div>
      <ActionBar actions={[{label:'Cancel',onTap:()=>{}},{label:existing?'Save Changes':'Create Profile',onTap:()=>{}}]}/>
    </div>
  );
};

// ── Travel Home ────────────────────────────────────────────
const TravelHomePage = ({data}) => {
  const home=TRAVEL_HOMES.find(h=>h.id===data.id)||TRAVEL_HOMES[0];
  return (
    <div style={{height:'100%',position:'relative',display:'flex',flexDirection:'column'}}>
      <div style={{flex:1,overflowY:'auto',paddingBottom:88}}>
        <Wire h={220} label={`[ ${home.name} · Photo gallery ]`}/>
        <div style={{padding:'16px 20px 0'}}>
          <div style={{marginBottom:16}}>
            <div style={tx(20,400)}>{home.name}</div>
            <div style={{...tx(12,400,C.text2),marginTop:2}}>{home.location} · {home.type}</div>
          </div>
          <div style={{padding:'12px 16px',marginBottom:20,background:C.text1,borderRadius:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={tx(11,500,C.white)}>Your travel balance</div>
              <div style={{...tx(10,400),color:'rgba(255,255,255,0.6)',marginTop:1}}>Valid for this home</div>
            </div>
            <div><span style={tx(22,300,C.white)}>18</span><span style={{...tx(10,400),color:'rgba(255,255,255,0.6)'}}> nights</span></div>
          </div>
          <div style={{display:'flex',gap:8,marginBottom:20}}>
            <StatBox label="Min stay" value={`${home.nights} nights`}/>
            <StatBox label="Availability" value={home.available?'Now':'Limited'} color={home.available?C.green:C.amber}/>
            <StatBox label="Cost" value={`${home.nights} nights`}/>
          </div>
          <Section title="What's included">
            <Stack gap={7}>
              {['Private host & welcome','Daily housekeeping','Local concierge','Activities booking','Airport transfer'].map((f,i)=>(
                <div key={i} style={{display:'flex',gap:8}}>
                  <span style={tx(11,400,C.green)}>✓</span><span style={tx(12,400,C.text2)}>{f}</span>
                </div>
              ))}
            </Stack>
          </Section>
          <Hr/>
          <Section title="Select Dates">
            <Wire h={120} label="[ Availability calendar · Select your dates ]"/>
          </Section>
        </div>
      </div>
      <ActionBar actions={[{label:'Select Dates',onTap:()=>{}},{label:`Book · ${home.nights} nights`,onTap:()=>{}}]}/>
    </div>
  );
};

// ── Travel All Page ────────────────────────────────────────
const TRAVEL_ALL = [
  {id:'th1',name:'Kyoto Machiya',location:'Kyoto, Japan',type:'Traditional house',size:'120m²',beds:2,nights:3,available:true,tags:['Cultural','City','Year-round']},
  {id:'th2',name:'Florence Apartment',location:'Florence, Italy',type:'Historic apartment',size:'90m²',beds:2,nights:4,available:true,tags:['Cultural','City','Year-round']},
  {id:'th3',name:'Verbier Chalet',location:'Verbier, Switzerland',type:'Alpine chalet',size:'180m²',beds:4,nights:5,available:false,tags:['Mountain','Ski','Winter']},
  {id:'th4',name:'Bali Villa',location:'Canggu, Bali',type:'Villa',size:'240m²',beds:3,nights:4,available:true,tags:['Beach','Tropical','Year-round']},
  {id:'th5',name:'Niseko Cabin',location:'Niseko, Japan',type:'Forest cabin',size:'80m²',beds:2,nights:3,available:true,tags:['Mountain','Ski','Winter']},
  {id:'th6',name:'Amalfi House',location:'Positano, Italy',type:'Cliffside house',size:'150m²',beds:3,nights:5,available:true,tags:['Beach','Cultural','Summer']},
  {id:'th7',name:'Lech Studio',location:'Lech, Austria',type:'Ski studio',size:'55m²',beds:1,nights:2,available:true,tags:['Mountain','Ski','Winter']},
  {id:'th8',name:'Dubai Penthouse',location:'Dubai, UAE',type:'Penthouse',size:'320m²',beds:4,nights:6,available:false,tags:['City','Luxury','Year-round']},
];

const TravelAllPage = ({navigate}) => {
  const [filter,setFilter] = useState('All');
  const regionFilters = ['All','Mountain','Beach','Cultural','City'];
  const filtered = filter==='All' ? TRAVEL_ALL : TRAVEL_ALL.filter(h=>h.tags.includes(filter));
  const available = filtered.filter(h=>h.available).length;
  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'10px 20px',background:C.text1,flexShrink:0}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={tx(11,500,C.white)}>Travel Balance</div>
            <div style={{...tx(10,400),color:'rgba(255,255,255,0.6)',marginTop:1}}>Use across all Fourma Homes</div>
          </div>
          <div><span style={tx(22,300,C.white)}>18</span><span style={{...tx(10,400),color:'rgba(255,255,255,0.6)'}}> nights</span></div>
        </div>
      </div>
      <div style={{padding:'10px 20px 8px',borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <FilterRow options={regionFilters} active={filter} setActive={setFilter}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'12px 20px 96px'}}>
        <div style={{...tx(11,400,C.text2),marginBottom:12}}>{available} available · {filtered.length} homes</div>
        <Stack gap={12}>
          {filtered.map((h,i)=>(
            <TapCard key={i} onTap={()=>navigate('travel-home',{id:h.id})}>
              <div style={{height:120,background:C.border,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                <span style={tx(10,400,C.text3)}>[ {h.name} · photo ]</span>
                <div style={{position:'absolute',top:8,right:8,padding:'3px 8px',background:h.available?'rgba(58,125,68,0.9)':'rgba(0,0,0,0.55)',borderRadius:4}}>
                  <span style={tx(9,500,C.white)}>{h.available?'Available':'Unavailable'}</span>
                </div>
              </div>
              <div style={{padding:'12px 14px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                  <div>
                    <div style={tx(13,600)}>{h.name}</div>
                    <div style={{...tx(10,400,C.text3),marginTop:1}}>{h.location} · {h.type}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={tx(12,600)}>from {h.nights}</div>
                    <div style={tx(9,400,C.text3)}>nights</div>
                  </div>
                </div>
                <div style={{display:'flex',gap:8,marginBottom:10}}>
                  <StatBox label="Size" value={h.size}/>
                  <StatBox label="Beds" value={`${h.beds} beds`}/>
                  <StatBox label="Min stay" value={`${h.nights} nights`}/>
                </div>
                <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                  {h.tags.map((t,j)=><Chip key={j} label={t}/>)}
                </div>
              </div>
            </TapCard>
          ))}
        </Stack>
      </div>
    </div>
  );
};

// ═══ ROOT TAB SCREENS ══════════════════════════════════════

// ── Today ──────────────────────────────────────────────────
const TODAY_ITEMS = [
  {type:'homes',profile:null,tag:'LECH CHALET · OWNERSHIP',title:'Bill due: HOA fee · €840',sub:'Due July 1 · Tap to review',nav:['home',{id:'home_lech'}],hasImage:false},
  {type:'deals',profile:null,tag:'TUSCANY · DEAL',title:'Due diligence: 2 documents pending',sub:'Legal review in progress →',nav:['deal',{propId:'prop_tuscany_1'}],hasImage:false},
  {type:'matches',profile:'sp_alpine',tag:'ALPINE PROFILE · NEW MATCH',title:'New match: Chalet · Kitzbühel · €1.8M',sub:'Matches your Alpine profile →',nav:['property',{id:'prop_lech_2'}],hasImage:true,imageLabel:'Chalet · Kitzbühel'},
  {type:'homes',profile:null,tag:'LECH CHALET · STAY',title:'Your stay starts in 14 days',sub:'Jul 14–21 · Check-in details →',nav:['home',{id:'home_lech'}],hasImage:true,imageLabel:'Chalet Lech'},
  {type:'matches',profile:'sp_japan',tag:'JAPAN PROFILE · NEW MATCH',title:'New villa · Niseko · ¥210M',sub:'Matches your Japan profile →',nav:['property',{id:'prop_hokkaido_1'}],hasImage:true,imageLabel:'Villa · Niseko'},
  {type:'insights',profile:null,tag:'HOKKAIDO · LOCATION INSIGHT',title:'Foreign ownership regulations updated',sub:'Key changes for non-residents →',nav:['location',{id:'hokkaido'}],hasImage:true,imageLabel:'Hokkaido, Japan'},
  {type:'insights',profile:null,tag:'ALPINE · MARKET SIGNAL',title:'Alpine prices up 3.2% YTD',sub:'Read full analysis →',nav:['location',{id:'lech'}],hasImage:true,imageLabel:'Market chart'},
];

const TodayScreen = ({navigate}) => {
  const [typeF,setTypeF] = useState('All');
  const [profF,setProfF] = useState('All profiles');
  const typeFilters = ['All','My Homes','Deals','Matches','Insights'];
  const profFilters = ['All profiles','🏔 Alpine','🌊 Japan'];
  const typeMap = {'My Homes':'homes','Deals':'deals','Matches':'matches','Insights':'insights'};
  const profMap = {'🏔 Alpine':'sp_alpine','🌊 Japan':'sp_japan'};

  const filtered = TODAY_ITEMS.filter(item => {
    const typeOk = typeF==='All' || item.type===typeMap[typeF];
    const profOk = profF==='All profiles' || item.profile===profMap[profF];
    return typeOk && profOk;
  });

  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column'}}>
      {/* Filters */}
      <div style={{padding:'10px 20px 8px',borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <FilterRow options={typeFilters} active={typeF} setActive={v=>{setTypeF(v);if(v!=='Matches')setProfF('All profiles');}}/>
        {typeF==='Matches' && (
          <div style={{marginTop:8}}>
            <FilterRow options={profFilters} active={profF} setActive={setProfF}/>
          </div>
        )}
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'12px 20px 96px'}}>
        <Stack gap={10}>
          {filtered.map((item,i)=>(
            <div key={i} onClick={()=>navigate(...item.nav)} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden',cursor:'pointer'}}>
              {/* Image placeholder for relevant items */}
              {item.hasImage && (
                <div style={{height:80,background:C.border,display:'flex',alignItems:'center',justifyContent:'center',borderBottom:`1px solid ${C.border}`}}>
                  <span style={{...tx(9,400,C.text3)}}>[ {item.imageLabel} ]</span>
                </div>
              )}
              <div style={{padding:'10px 14px'}}>
                <div style={{...tx(9,500,C.text3),letterSpacing:'0.1em',marginBottom:5}}>{item.tag}</div>
                <div style={tx(12,500)}>{item.title}</div>
                <div style={{...tx(11,400,C.text2),marginTop:2}}>{item.sub}</div>
              </div>
            </div>
          ))}
          {filtered.length===0 && (
            <div style={{padding:24,border:`1.5px dashed ${C.border}`,borderRadius:12,...tx(12,400,C.text3),textAlign:'center'}}>No updates matching this filter</div>
          )}
        </Stack>
      </div>
    </div>
  );
};

// ── Explore ────────────────────────────────────────────────
const ExploreScreen = ({navigate}) => {
  const [filter,setFilter] = useState('All');
  return (
    <div style={{padding:'12px 20px 96px',overflowY:'auto',height:'100%'}}>
      <div style={{height:42,background:C.surface,border:`1px solid ${C.border}`,borderRadius:21,display:'flex',alignItems:'center',gap:8,padding:'0 14px',marginBottom:12}}>
        <span style={tx(13,400,C.text3)}>🔍</span><span style={tx(12,400,C.text3)}>Search locations, properties…</span>
      </div>
      <FilterRow options={['All','Profiles','Travel','Locations']} active={filter} setActive={setFilter}/>
      <div style={{height:18}}/>

      <Section title="Search Profiles" action="+ New">
        <Stack gap={10}>
          {SEARCH_PROFILES.map((p,i)=>(
            <TapCard key={i} onTap={()=>navigate('profile-feed',{id:p.id})}>
              <div style={{padding:'12px 14px',display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:20}}>{p.icon}</span>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={tx(13,600)}>{p.name}</span>
                    <span style={{padding:'2px 8px',background:C.text1,borderRadius:10,...tx(9,600,C.white)}}>{p.badge}</span>
                  </div>
                  <div style={{...tx(10,400,C.text3),marginTop:2}}>{p.sub}</div>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <span onClick={e=>{e.stopPropagation();navigate('profile-editor',{id:p.id});}} style={{...tx(10,400,C.text3),cursor:'pointer',padding:'4px 8px',border:`1px solid ${C.border}`,borderRadius:6,background:C.white}}>Edit</span>
                  <span style={tx(12,400,C.text3)}>›</span>
                </div>
              </div>
              <div style={{borderTop:`1px solid ${C.border}`,padding:'8px 14px',display:'flex',gap:6,flexWrap:'wrap'}}>
                {p.params.map((param,j)=><div key={j} style={{padding:'3px 8px',background:C.white,border:`1px solid ${C.border}`,borderRadius:6,...tx(9,400,C.text2)}}>{param}</div>)}
              </div>
            </TapCard>
          ))}
          <div onClick={()=>navigate('profile-editor',{})} style={{padding:'12px 14px',border:`1.5px dashed ${C.border}`,borderRadius:12,...tx(12,400,C.text3),textAlign:'center',cursor:'pointer'}}>+ Create new search profile</div>
        </Stack>
      </Section>
      <Hr/>

      <div style={{marginBottom:10}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <span style={tx(12,600)}>Fourma Travel</span>
          <span onClick={()=>navigate('travel-all',{})} style={{...tx(10,400,C.text3),cursor:'pointer'}}>View all ›</span>
        </div>
        <div style={{padding:'10px 14px',marginBottom:10,background:C.text1,borderRadius:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={tx(11,500,C.white)}>Travel Balance</div>
            <div style={{...tx(10,400),color:'rgba(255,255,255,0.6)',marginTop:2}}>Valid across all Fourma Homes</div>
          </div>
          <div><span style={tx(22,300,C.white)}>18</span><span style={{...tx(10,400),color:'rgba(255,255,255,0.6)'}}> nights</span></div>
        </div>
        <HScroll>
          {TRAVEL_HOMES.map((h,i)=>(
            <div key={i} onClick={()=>navigate('travel-home',{id:h.id})} style={{minWidth:140,flexShrink:0,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden',cursor:'pointer'}}>
              <div style={{height:80,background:C.border,display:'flex',alignItems:'center',justifyContent:'center'}}><span style={tx(9,400,C.text3)}>[ photo ]</span></div>
              <div style={{padding:'8px 10px'}}>
                <div style={tx(11,600)}>{h.name}</div>
                <div style={{...tx(9,400,C.text3),marginTop:1}}>{h.location}</div>
                <div style={{marginTop:5,display:'flex',gap:4,alignItems:'center'}}>
                  <span style={{...tx(9,500),color:h.available?C.green:C.amber}}>●</span>
                  <span style={tx(9,400,C.text2)}>from {h.nights} nights</span>
                </div>
              </div>
            </div>
          ))}
        </HScroll>
      </div>
      <Hr/>

      <Section title="Location Intelligence">
        <Stack gap={10}>
          {[
            {id:'lech',name:'Lech am Arlberg',country:'Austria',tags:['Foreign friendly','Alpine'],market:'+3.2% YTD',mc:C.green,updates:2,source:'Owned home'},
            {id:'hokkaido',name:'Hokkaido',country:'Japan',tags:['Conditions apply','Ski · Onsen'],market:'+5.1% YTD',mc:C.green,updates:1,source:'Search profile'},
            {id:'tuscany',name:'Tuscany',country:'Italy',tags:['EU friendly','Culture · Wine'],market:'+1.4% YTD',mc:C.text2,updates:0,source:'Active deal'},
          ].map((loc,i)=>(
            <TapCard key={i} onTap={()=>navigate('location',{id:loc.id})}>
              <div style={{padding:'12px 14px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                      <span style={tx(13,600)}>{loc.name}</span>
                      {loc.updates>0 && (
                        <span style={{padding:'1px 7px',background:C.text1,borderRadius:10,...tx(9,600,C.white)}}>{loc.updates} new</span>
                      )}
                    </div>
                    <div style={{...tx(10,400,C.text3)}}>{loc.country} · {loc.source}</div>
                  </div>
                  <div style={{...tx(12,600),color:loc.mc,flexShrink:0}}>{loc.market}</div>
                </div>
                <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                  {loc.tags.map((t,j)=><Tag key={j} label={t}/>)}
                </div>
              </div>
            </TapCard>
          ))}
          <div style={{padding:'10px 14px',border:`1.5px dashed ${C.border}`,borderRadius:12,...tx(12,400,C.text3),textAlign:'center',cursor:'pointer'}}>
            + Add location
          </div>
        </Stack>
      </Section>
    </div>
  );
};

// ── Homes ──────────────────────────────────────────────────
const HomesScreen = ({navigate}) => (
  <div style={{padding:'12px 20px 96px',overflowY:'auto',height:'100%'}}>
    <Section title="Stays" action="View all">
      <TapCard onTap={()=>navigate('stays',{})}>
        <div style={{padding:14}}>
          <div style={{...tx(10,500,C.text3),letterSpacing:'0.08em',marginBottom:8}}>UPCOMING</div>
          <Stack gap={8}>
            {STAYS.filter(s=>s.status==='upcoming').map(s=>(
              <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={tx(12,500)}>{s.home}</div>
                  <div style={{...tx(10,400,C.text3),marginTop:1}}>{s.dates} · {s.nights} nights</div>
                </div>
                {s.travel && <Tag label="Travel" color={C.green} bg={C.greenBg}/>}
              </div>
            ))}
          </Stack>
          <div style={{...tx(10,400,C.text3),marginTop:10}}>View all stays & history →</div>
        </div>
      </TapCard>
    </Section>
    <Hr/>

    <Section title="My Homes" action="+ Add">
      <Stack>
        {Object.values(HOMES).map((home,i)=>(
          <TapCard key={i} onTap={()=>navigate('home',{id:home.id})}>
            <div style={{padding:14}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={tx(13,500)}>{home.name}</span>
                <span style={{...tx(10,500),color:C.green,background:C.greenBg,padding:'2px 8px',borderRadius:10}}>Active</span>
              </div>
              <div style={tx(11,400,C.text2)}>{home.location} · {home.type}</div>
              <div style={{...tx(10,400,C.text3),marginTop:6}}>
                {home.nextStay?`Next stay: ${home.nextStay}`:`Balance: ${home.balance}`} →
              </div>
            </div>
          </TapCard>
        ))}
      </Stack>
    </Section>
    <Hr/>

    <Section title="My Projects">
      <Stack gap={10}>
        {PROJECTS.map((proj,i)=>(
          <TapCard key={i} onTap={()=>navigate('project',{id:proj.id})}>
            <div style={{padding:14}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={tx(13,500)}>{proj.name}</span>
                <Tag label={proj.status} color={C.amber} bg={C.amberBg}/>
              </div>
              <div style={tx(11,400,C.text2)}>{proj.location}</div>
              <div style={{...tx(10,400,C.text3),marginTop:6}}>{proj.phase} · {proj.budget} →</div>
            </div>
          </TapCard>
        ))}
        {/* Start new project CTA */}
        <div onClick={()=>navigate('project-intake',{})} style={{padding:'14px',border:`1.5px dashed ${C.border}`,borderRadius:12,cursor:'pointer',display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:36,height:36,borderRadius:18,background:C.surface,border:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'center',...tx(18)}}>+</div>
          <div>
            <div style={tx(12,500)}>Start a new project</div>
            <div style={{...tx(10,400,C.text3),marginTop:1}}>Land · Renovation · Ownership restructuring</div>
          </div>
        </div>
      </Stack>
    </Section>
    <Hr/>

    <Section title="Active Deals">
      <TapCard onTap={()=>navigate('deal',{propId:'prop_tuscany_1'})}>
        <div style={{padding:14}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
            <span style={tx(13,500)}>Farmhouse · Tuscany</span>
            <span style={{...tx(10,500),color:C.amber,background:C.amberBg,padding:'2px 8px',borderRadius:10}}>Due Diligence</span>
          </div>
          <div style={tx(11,400,C.text2)}>€890K · Full ownership</div>
          <div style={{display:'flex',gap:4,marginTop:10}}>
            {['Search','Offer','DD','Closing'].map((s,i)=>(
              <div key={s} style={{flex:1,textAlign:'center'}}>
                <div style={{height:3,borderRadius:2,marginBottom:3,background:i<=2?C.text1:C.border}}/>
                <span style={tx(8,i<=2?600:400,i<=2?C.text1:C.text3)}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{...tx(10,400,C.text3),marginTop:8}}>2 documents pending →</div>
        </div>
      </TapCard>
    </Section>
    <Hr/>

    <Section title="Shortlisted" action="View all">
      <Stack>
        {[{label:'Chalet · Kitzbühel, Austria · €1.8M',id:'prop_lech_2'},{label:'Chalet · Lech · €2.1M',id:'prop_lech_1'}].map((p,i)=>(
          <TapCard key={i} onTap={()=>navigate('property',{id:p.id})}>
            <div style={{padding:'12px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={tx(12,400,C.text2)}>♡  {p.label}</span>
              <span style={tx(11,400,C.text3)}>›</span>
            </div>
          </TapCard>
        ))}
      </Stack>
    </Section>
  </div>
);

// ── Assist ─────────────────────────────────────────────────
const INIT_MSGS=[
  {role:'ai',text:'Hi Alex. How can I help you today?'},
  {role:'user',text:'Book me 3 nights in Lech in July'},
  {role:'ai',text:'Your Lech Chalet has availability. I can book Jul 14–17 right now, or you can choose dates yourself.',links:[{label:'Book Jul 14–17 now'},{label:'View Lech calendar →'}]},
  {role:'user',text:'Book Jul 14–17'},
  {role:'ai',text:'Done. Stay confirmed Jul 14–17. Check-in details sent.',links:[{label:'View stay details →'}]},
];
const SUGGS=['What bills are due?','Tuscany deal status','Activities in Lech this week','I want to buy in Japan'];
const AssistScreen = () => {
  const [msgs,setMsgs]=useState(INIT_MSGS); const [inp,setInp]=useState('');
  const ref=useRef(null);
  useEffect(()=>{ref.current?.scrollIntoView({behavior:'smooth'});},[msgs]);
  const send=(text)=>{
    if(!text.trim()) return;
    setMsgs(m=>[...m,{role:'user',text},{role:'ai',text:'Got it. Let me help with that.',links:[{label:'View details →'}]}]);
    setInp('');
  };
  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column'}}>
      {msgs.length<=5 && (
        <div style={{padding:'10px 16px',borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{...tx(9,500,C.text3),letterSpacing:'0.08em',marginBottom:6}}>QUICK ACTIONS</div>
          <HScroll>
            {SUGGS.map((s,i)=><div key={i} onClick={()=>send(s)} style={{padding:'6px 12px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,...tx(10,400,C.text2),whiteSpace:'nowrap',flexShrink:0,cursor:'pointer'}}>{s}</div>)}
          </HScroll>
        </div>
      )}
      <div style={{flex:1,overflowY:'auto',padding:'16px 16px 8px'}}>
        <Stack gap={12}>
          {msgs.map((m,i)=>(
            <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
              <div style={{maxWidth:'80%'}}>
                <div style={{padding:'10px 14px',background:m.role==='user'?C.accent:C.surface,border:`1px solid ${m.role==='user'?C.accent:C.border}`,borderRadius:m.role==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px',...tx(12,400,m.role==='user'?C.white:C.text1)}}>{m.text}</div>
                {m.links && <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:6}}>{m.links.map((l,j)=><div key={j} style={{padding:'8px 14px',background:C.white,border:`1px solid ${C.border}`,borderRadius:10,...tx(11,500),cursor:'pointer',display:'flex',justifyContent:'space-between'}}><span>{l.label}</span><span style={tx(11,400,C.text3)}>↗</span></div>)}</div>}
              </div>
            </div>
          ))}
        </Stack>
        <div ref={ref}/>
      </div>
      <div style={{padding:'10px 16px 24px',borderTop:`1px solid ${C.border}`,background:C.white,flexShrink:0,display:'flex',gap:8}}>
        <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send(inp)} placeholder="Ask anything…"
          style={{flex:1,height:40,borderRadius:20,border:`1px solid ${C.border}`,padding:'0 14px',...tx(12,400,C.text1),outline:'none',background:C.surface}}/>
        <button onClick={()=>send(inp)} style={{width:40,height:40,borderRadius:20,background:C.accent,border:'none',color:C.white,cursor:'pointer',fontSize:16}}>↑</button>
      </div>
    </div>
  );
};

// ── Profile tab ────────────────────────────────────────────
const ProfileScreen = () => (
  <div style={{padding:'12px 20px 96px',overflowY:'auto',height:'100%'}}>
    <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
      <div style={{width:52,height:52,borderRadius:26,background:C.surface,border:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'center',...tx(18,400,C.text3)}}>A</div>
      <div><div style={tx(15,500)}>Alex M.</div><div style={{...tx(10,400,C.text3),marginTop:2}}>Fourma Member · 2026</div></div>
    </div>
    <Section title="Ownership DNA"><Wire h={80} label="[ Mountain + Culture · Co-ownership preferred · €1–3M ]"/></Section>
    <Hr/>
    <Section title="Search Profiles" action="Manage">
      <Stack><Wire h={48} label="[ 🏔  Alpine chalet · Austria / Switzerland · Active ]"/><Wire h={48} label="[ 🌊  Beach / cultural · Japan · Active ]"/></Stack>
    </Section>
    <Hr/>
    <Section title="Settings">
      {['Notifications','Privacy preferences','Language & currency','Documents & legal','Membership'].map(s=>(
        <div key={s} style={{padding:'11px 0',borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',...tx(12,400,C.text2)}}>
          <span>{s}</span><span style={tx(12,400,C.text3)}>›</span>
        </div>
      ))}
    </Section>
  </div>
);

// ═══ NAVIGATION ════════════════════════════════════════════
const NAV=[{id:'today',icon:'◈',label:'Today'},{id:'explore',icon:'⊙',label:'Explore'},{id:'homes',icon:'⬡',label:'Homes'},{id:'assist',icon:'✦',label:'Assist'},{id:'profile',icon:'◯',label:'Profile'}];

const BottomNav=({active,setActive})=>(
  <div style={{position:'absolute',bottom:0,left:0,right:0,height:80,background:C.white,borderTop:`1px solid ${C.border}`,display:'flex',alignItems:'flex-start',paddingTop:10}}>
    {NAV.map(n=>(
      <button key={n.id} onClick={()=>setActive(n.id)} style={{flex:1,background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:0}}>
        <span style={{fontSize:17,color:active===n.id?C.text1:C.text3}}>{n.icon}</span>
        <span style={tx(9,active===n.id?600:400,active===n.id?C.text1:C.text3)}>{n.label}</span>
        {active===n.id && <div style={{width:4,height:4,borderRadius:2,background:C.text1}}/>}
      </button>
    ))}
  </div>
);

const PAGE_TITLES={
  location:d=>LOCATIONS[d.id]?.name||'Location',
  property:d=>PROPERTIES[d.id]?.name||'Property',
  home:d=>HOMES[d.id]?.name||'Home',
  deal:()=>'Active Deal',
  'profile-feed':d=>SEARCH_PROFILES.find(p=>p.id===d.id)?.name||'Search Profile',
  'profile-editor':d=>d.id?'Edit Profile':'New Profile',
  'travel-home':d=>TRAVEL_HOMES.find(h=>h.id===d.id)?.name||'Fourma Home',
  activities:d=>LOCATIONS[d.locationId]?.name+' · Activities'||'Activities',
  stays:()=>'My Stays',
  'travel-all':()=>'Fourma Travel',
  'project-intake':()=>'New Project',
  project:d=>(PROJECTS.find(p=>p.id===d.id)?.name)||'Project',
};

const AppShell=({tab,setTab})=>{
  const [stacks,setStacks]=useState({today:[],explore:[],homes:[],assist:[],profile:[]});
  const navigate=(screen,data={})=>setStacks(s=>({...s,[tab]:[...s[tab],{screen,data}]}));
  const goBack=()=>setStacks(s=>({...s,[tab]:s[tab].slice(0,-1)}));
  const stack=stacks[tab]; const isRoot=stack.length===0;
  const current=isRoot?{screen:tab,data:{}}:stack[stack.length-1];
  const pageTitle=!isRoot?(PAGE_TITLES[current.screen] ? PAGE_TITLES[current.screen](current.data) : ''):'';
  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'0 20px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',flexShrink:0,height:48,position:'relative'}}>
        {isRoot?(
          <>
            <div style={{...tx(11,700),letterSpacing:'0.2em'}}>⬚ FOURMA</div>
            <div style={{...tx(14,400,C.text3),marginLeft:'auto'}}>🔔</div>
          </>
        ):(
          <>
            <button onClick={goBack} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:6,padding:0,zIndex:1}}>
              <span style={tx(16,400)}>←</span><span style={tx(12,400,C.text2)}>Back</span>
            </button>
            <div style={{position:'absolute',left:0,right:0,textAlign:'center',...tx(12,600),pointerEvents:'none',padding:'0 80px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{pageTitle}</div>
          </>
        )}
      </div>
      <div style={{flex:1,position:'relative',overflow:'hidden'}}>
        <div style={{height:'100%'}}>
          {!isRoot && current.screen==='location'      && <LocationPage data={current.data} navigate={navigate}/>}
          {!isRoot && current.screen==='activities'    && <ActivitiesPage data={current.data} navigate={navigate}/>}
          {!isRoot && current.screen==='property'      && <PropertyPage data={current.data} navigate={navigate}/>}
          {!isRoot && current.screen==='home'          && <HomeDetailPage data={current.data} navigate={navigate}/>}
          {!isRoot && current.screen==='deal'          && <DealPage data={current.data} navigate={navigate}/>}
          {!isRoot && current.screen==='profile-feed'  && <ProfileFeedPage data={current.data} navigate={navigate}/>}
          {!isRoot && current.screen==='profile-editor'&& <ProfileEditorPage data={current.data} navigate={navigate}/>}
          {!isRoot && current.screen==='travel-home'   && <TravelHomePage data={current.data} navigate={navigate}/>}
          {!isRoot && current.screen==='travel-all'    && <TravelAllPage navigate={navigate}/>}
          {!isRoot && current.screen==='stays'         && <StaysPage navigate={navigate}/>}
          {!isRoot && current.screen==='project-intake' && <ProjectIntakePage data={current.data} navigate={navigate}/>}
          {!isRoot && current.screen==='project'        && <ProjectDetailPage data={current.data} navigate={navigate}/>}
          {isRoot && tab==='today'   && <TodayScreen navigate={navigate}/>}
          {isRoot && tab==='explore' && <ExploreScreen navigate={navigate}/>}
          {isRoot && tab==='homes'   && <HomesScreen navigate={navigate}/>}
          {isRoot && tab==='assist'  && <AssistScreen/>}
          {isRoot && tab==='profile' && <ProfileScreen/>}
        </div>
        {isRoot && <BottomNav active={tab} setActive={setTab}/>}
      </div>
    </div>
  );
};

export default function FourmaWireframe() {
  const [screen,setScreen]=useState('onboarding'); const [tab,setTab]=useState('today');
  return (
    <div style={{minHeight:'100vh',background:C.pageBg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:"-apple-system,'Inter',system-ui,sans-serif",padding:'24px 16px',gap:14}}>
      <div style={{...tx(9,500,'#AAAAA8'),letterSpacing:'0.15em',textTransform:'uppercase'}}>Fourma · Mobile App · Wireframe · v0.4</div>
      <div style={{width:375,height:780,background:C.white,borderRadius:46,boxShadow:'0 28px 72px rgba(0,0,0,0.22), 0 0 0 8px #1A1A1A',overflow:'hidden',display:'flex',flexDirection:'column'}}>
        <div style={{height:44,background:C.white,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px'}}>
          <span style={tx(11,600)}>9:41</span>
          <div style={{width:100,height:26,background:'#111',borderRadius:13}}/>
          <span style={tx(10,400,C.text3)}>●●●</span>
        </div>
        <div style={{flex:1,overflow:'hidden'}}>
          {screen==='onboarding' && <Onboarding onNext={()=>setScreen('quiz')}/>}
          {screen==='quiz' && <Quiz onDone={()=>{setScreen('app');setTab('today');}}/>}
          {screen==='app' && <AppShell tab={tab} setTab={setTab}/>}
        </div>
      </div>
      <div style={{...tx(10,400,'#AAAAA8'),textAlign:'center',maxWidth:360}}>
        {screen==='onboarding' && 'Tap "Get Started" →'}
        {screen==='quiz' && 'Complete 3 questions →'}
        {screen==='app' && 'Today: фильтры по типу и профилю · Explore: Edit profile · Homes: Stays · Location: Activities'}
      </div>
    </div>
  );
}