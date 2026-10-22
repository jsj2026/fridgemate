exports.handler=async(event)=>{
 if(event.httpMethod!=='POST')return {statusCode:405,body:JSON.stringify({error:'POST only'})};
 const key=process.env.OPENAI_API_KEY;
 if(!key)return {statusCode:503,headers:{'Content-Type':'application/json'},body:JSON.stringify({error:'Netlify 환경변수 OPENAI_API_KEY가 설정되지 않았습니다.'})};
 try{
  if((event.body||'').length>12000000)return {statusCode:413,body:JSON.stringify({error:'사진 크기가 너무 큽니다.'})};
  const {front,date}=JSON.parse(event.body||'{}');
  const valid=s=>typeof s==='string'&&/^data:image\/jpeg;base64,[a-zA-Z0-9+/=]+$/.test(s);
  if(!valid(front)||!valid(date))return {statusCode:400,body:JSON.stringify({error:'제품 앞면과 소비기한 JPEG 사진이 필요합니다.'})};
  const prompt='한국 식품 포장지 사진 2장입니다. 첫 번째는 제품 앞면, 두 번째는 소비기한 인쇄 부분입니다. 보이는 글자에 근거해 상품명과 소비기한을 추출하세요. 제조일자와 소비기한을 혼동하지 마세요. 확실하지 않으면 빈 문자열로 두세요. 반드시 JSON 객체만 반환: {"name":"상품명 또는 빈 문자열","expiry":"YYYY-MM-DD 또는 빈 문자열","notes":"판독 근거, 모호한 점을 한국어로 짧게"}';
  const response=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-4.1-mini',temperature:0,response_format:{type:'json_object'},messages:[{role:'user',content:[{type:'text',text:prompt},{type:'image_url',image_url:{url:front,detail:'high'}},{type:'image_url',image_url:{url:date,detail:'high'}}]}],max_tokens:450})});
  const result=await response.json();
  if(!response.ok)return {statusCode:502,headers:{'Content-Type':'application/json'},body:JSON.stringify({error:'AI 서비스 요청 실패: '+(result.error?.message||response.status)})};
  const parsed=JSON.parse(result.choices?.[0]?.message?.content||'{}');
  const expiry=typeof parsed.expiry==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(parsed.expiry)?parsed.expiry:'';
  return {statusCode:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify({name:String(parsed.name||'').slice(0,100),expiry,notes:String(parsed.notes||'').slice(0,1000)})};
 }catch(e){return {statusCode:500,headers:{'Content-Type':'application/json'},body:JSON.stringify({error:'분석 처리 실패: '+e.message})}}
};
