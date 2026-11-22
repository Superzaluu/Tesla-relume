# Шагналын купоны n8n webhook

Захиалагч азын хүрд эргүүлэхэд сайт `N8N_VOUCHER_WEBHOOK_URL` руу нэг удаа POST илгээнэ
(`X-Webhook-Secret: <N8N_WEBHOOK_SECRET>` толгойтой). n8n энэ мэдээллээр и-мэйл илгээнэ.

```json
{
  "type": "preorder_voucher",
  "code": "RC-7K2M-9QXD",
  "prize": "50,000 ₮-ийн хөнгөлөлт",
  "prize_key": "cash50",
  "model": "Ruichi C5",
  "model_image": "https://<домэйн>/assets/thumbs/c5.jpg",
  "voucher_url": "https://<домэйн>/preorder/voucher/?ref=<захиалгын id>",
  "name": "Бат", "last_name": "Дорж",
  "email": "name@example.mn", "phone": "9911 2233", "facebook": "facebook.com/...",
  "messenger_ref": "voucher_RC-7K2M-9QXD",
  "claim": "Машинаа хүлээн авахдаа энэ кодыг үзүүлж шагналаа авна."
}
```

## n8n workflow (санал)

1. **Webhook** node (POST), `X-Webhook-Secret` толгойг шалгана.
2. **Send Email** (Gmail эсвэл SMTP): гарчиг «Таны Ruichi шагналын купон», HTML дотор
   - `model_image` зураг, `model`, `prize` том үсгээр;
   - бар код: `https://bwipjs-api.metafloor.com/?bcid=code128&text={{code}}&scale=3&includetext` (эсвэл n8n-ийн өөрийн barcode node);
   - `voucher_url` холбоос («Купоноо нээх»), `claim` бичвэр.
3. (Сонголт) **Facebook Messenger**: хэрэглэгч `m.me/<page>?ref=voucher_<code>` товчоор Page руу бичихэд Messenger webhook-ийн
   `referral.ref` = `messenger_ref` ирнэ. Түүгээр купоныг олж (Supabase `preorders.voucher_code`) хариу мессеж илгээнэ.
   Meta нь хүний хувийн профайл руу шууд бичихийг зөвшөөрдөггүй тул эхний мессежийг хэрэглэгч өөрөө илгээх ёстой.

Шагналыг `src/data/prizes.ts` дотор (жагсаалт ба магадлал) өөрчилнө. Шагнал ба код нь захиалгын id-аас
HMAC-аар гардаг тул хүрдийг дахин эргүүлсэн ч өөрчлөгдөхгүй.
