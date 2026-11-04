import React, { useMemo, useRef, useState } from 'react';

import { createRoot } from 'react-dom/client';

import {

  MessageCircle, CircleDashed, Users, Settings, Search, MoreVertical, Paperclip,

  Smile, Mic, Send, Plus, Check, CheckCheck, Star, Filter, ChevronDown,

  Video, Phone, Image as ImageIcon, FileText, Camera, Sticker, Bot, Sparkles,

  Package, ShoppingBag, Menu, X, ArrowLeft, PanelLeftClose, Bell, HelpCircle,

  CircleUserRound, MessageSquarePlus, CirclePlus, CheckCircle2, Clock3, Store, PhoneCall, Megaphone

} from 'lucide-react';

import './styles.css';



const initialChats = [

  { id:'ananya', name:'Ananya Sharma', subtitle:'', type:'customer', initials:'AS', color:'peach', time:'2:41 pm', unread:2, preview:'I need 10 kg rice and 2 litres oil', online:true, messages:[

    {from:'them',text:'Hi! Is Sona Masoori rice available?',time:'2:38 pm'},

    {from:'me',text:'Yes, it is available. We have 5 kg and 10 kg packs.',time:'2:39 pm',read:true},

    {from:'them',text:'I need 10 kg rice and 2 litres oil',time:'2:41 pm'}

  ]},

  { id:'ravi', name:'Ravi Stores', subtitle:'Supplier', type:'supplier', initials:'RS', color:'blue', time:'1:18 pm', unread:0, preview:'Invoice attached. Please confirm.', messages:[

    {from:'them',text:'Your weekly delivery is ready.',time:'1:10 pm'},

    {from:'them',text:'Invoice attached. Please confirm.',time:'1:18 pm',attachment:'invoice'}

  ]},

  { id:'kiran', name:'Kiran Kumar', type:'customer', initials:'KK', color:'green', time:'11:05 am', unread:0, preview:'Thanks! Will pick it up in the evening.', messages:[

    {from:'them',text:'Do you have sunflower oil?',time:'11:02 am'},

    {from:'me',text:'Yes, 1L and 5L packs are available.',time:'11:03 am',read:true},

    {from:'them',text:'Thanks! Will pick it up in the evening.',time:'11:05 am'}

  ]},

  { id:'meera', name:'Meera Fashions', type:'customer', initials:'MF', color:'purple', time:'Yesterday', unread:0, preview:'Can you send the new arrivals?', messages:[

    {from:'them',text:'Hello, can you send the new arrivals?',time:'Yesterday'}

  ]},

  { id:'sai', name:'Sai Distributors', subtitle:'Supplier', type:'supplier', initials:'SD', color:'yellow', time:'Yesterday', unread:0, preview:'Order dispatched. Expected by 10 AM.', messages:[

    {from:'them',text:'Your order has been dispatched. Expected by 10 AM tomorrow.',time:'Yesterday'}

  ]},

  { id:'lakshmi', name:'Lakshmi Devi', type:'customer', initials:'LD', color:'pink', time:'Tuesday', unread:0, preview:'Okay, thank you!', messages:[

    {from:'me',text:'Your order is ready for pickup.',time:'Tuesday',read:true},

    {from:'them',text:'Okay, thank you!',time:'Tuesday'}

  ]},

  { id:'wholesale', name:'Wholesale Orders', type:'group', initials:'WO', color:'teal', time:'Monday', unread:0, preview:'Ravi: Updated the price list', messages:[

    {from:'them',name:'Ravi',text:'Updated the price list for this week.',time:'Monday'}

  ]}

];



const initialAssistantChat = {

  id:'assistant', name:'MuseOps', type:'assistant', initials:'✦', color:'assistant', time:'now', unread:0,

  preview:'Business Operations Assistant',

  // Intentionally starts empty. Connect the model/API here when integration is ready.

  messages:[]

};



function Avatar({ chat, size='normal' }) {

  return <div className={`avatar ${chat.color || ''} ${size}`}>

    {chat.type === 'assistant' ? <span className="assistant-glyph">✦</span> : chat.initials}

    {chat.online && <i className="online-dot"/>}

  </div>;

}

function IconButton({title, children, onClick, active=false, className=''}) {

  return <button type="button" title={title} _aria-label_={title} onClick={onClick} className={`icon-btn ${active?'is-active':''} ${className}`}>{children}</button>;

}

function App() {

  const [chats,setChats] = useState(initialChats);

  const [assistantChat,setAssistantChat] = useState(initialAssistantChat);

  const [activeId,setActiveId] = useState('assistant');

  const [section,setSection] = useState('chats');

  const [search,setSearch] = useState('');

  const [filter,setFilter] = useState('all');

  const [draft,setDraft] = useState('');

  const [isAssistantThinking, setIsAssistantThinking] = useState(false);

  const [showChatSearch,setShowChatSearch] = useState(false);

  const [showMenu,setShowMenu] = useState(false);

  const [mobileChat,setMobileChat] = useState(false);

  const fileRef = useRef(null);

  const active = activeId === 'assistant' ? assistantChat : chats.find(c=>c.id===activeId) || chats[0];

  const visibleChats = useMemo(()=>chats.filter(c=>{

    const matches = `${c.name} ${c.preview}`.toLowerCase().includes(search.toLowerCase());

    const filterMatch = filter==='all' || (filter==='unread' && c.unread>0) || (filter==='favorites' && ['ananya','ravi'].includes(c.id)) || (filter==='groups' && c.type==='group');

    return matches && filterMatch;

  }),[chats,search,filter]);



  function selectChat(id) {

    setActiveId(id); setSection('chats'); setMobileChat(true); setShowMenu(false);

    setChats(prev=>prev.map(c=>c.id===id?{...c,unread:0}:c));

  }

  async function sendMessage() {

  const value = draft.trim();

  if (!value) return;



  const time = new Date().toLocaleTimeString([], {

    hour: '2-digit',

    minute: '2-digit'

  });



  if (activeId === 'assistant') {

    const userMessage = {

      from: 'me',

      text: value,

      time,

      read: true

    };



    const conversationHistory = [

      ...assistantChat.messages,

      userMessage

    ].map(message => ({

      role: message.from === 'me' ? 'user' : 'assistant',

      content: message.text

    }));



    setAssistantChat(prev => ({

      ...prev,

      messages: [...prev.messages, userMessage]

    }));



    setDraft('');

    setIsAssistantThinking(true);



    try {

      const response = await fetch('http://localhost:3001/api/chat', {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json'

        },

        body: JSON.stringify({

          messages: conversationHistory

        })

      });



      const data = await response.json();



      if (!response.ok) {

        throw new Error(data.error || 'MuseOps request failed.');

      }



      setAssistantChat(prev => ({

        ...prev,

        messages: [

          ...prev.messages,

          {

            from: 'assistant',

            text: data.reply,

            time: new Date().toLocaleTimeString([], {

              hour: '2-digit',

              minute: '2-digit'

            })

          }

        ]

      }));



    } catch (error) {

      console.error('MuseOps error:', error);



      setAssistantChat(prev => ({

        ...prev,

        messages: [

          ...prev.messages,

          {

            from: 'assistant',

            text: 'I couldn’t connect to MuseOps. Please try again.',

            time: new Date().toLocaleTimeString([], {

              hour: '2-digit',

              minute: '2-digit'

            })

          }

        ]

      }));



    } finally {

      setIsAssistantThinking(false);

    }



  } else {

    setChats(prev => prev.map(c =>

      c.id === activeId

        ? {

            ...c,

            preview: value,

            time,

            messages: [

              ...c.messages,

              { from: 'me', text: value, time, read: true }

            ]

          }

        : c

    ));



    setDraft('');

  }



  setTimeout(() => {

    document.querySelector('.messages-scroll')?.scrollTo({

      top: 99999,

      behavior: 'smooth'

    });

  }, 30);

  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const targetChatId = activeId;
    const uploadId = `upload-${Date.now()}-${file.name}`;
    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, PNG, or JPG invoice.');
      e.target.value = '';
      return;
    }

    const uploadMessage = {
      id: uploadId,
      from: 'me',
      text: file.name,
      time,
      read: true,
      attachment: 'file',
      uploading: true
    };

    if (targetChatId === 'assistant') {
      setAssistantChat(prev => ({
        ...prev,
        messages: [...prev.messages, uploadMessage]
      }));
    } else {
      setChats(prev => prev.map(c =>
        c.id === targetChatId
          ? {
              ...c,
              preview: `📎 ${file.name}`,
              time,
              messages: [...c.messages, uploadMessage]
            }
          : c
      ));
    }

    e.target.value = '';

    const updateMessage = (updates) => {
      if (targetChatId === 'assistant') {
        setAssistantChat(prev => ({
          ...prev,
          messages: prev.messages.map(m =>
            m.id === uploadId ? { ...m, ...updates } : m
          )
        }));
      } else {
        setChats(prev => prev.map(c =>
          c.id === targetChatId
            ? {
                ...c,
                messages: c.messages.map(m =>
                  m.id === uploadId ? { ...m, ...updates } : m
                )
              }
            : c
        ));
      }
    };

    try {
      const formData = new FormData();
      formData.append('invoice', file);

      const response = await fetch('http://localhost:3001/api/invoices/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invoice processing failed.');
      }

      updateMessage({
        uploading: false,
        invoiceResult: data
      });
    } catch (error) {
      console.error('Invoice upload error:', error);
      updateMessage({
        uploading: false,
        invoiceError: error.message
      });
    }
  }

  function openAssistant(){setActiveId('assistant');setSection('chats');setMobileChat(true);}



  return <div className="wa-app">

    <aside className="nav-rail">

      <div className="rail-top">

        <IconButton title="Chats" active={section==='chats'} onClick={()=>{setSection('chats');setMobileChat(false)}}><MessageCircle size={22}/><span className="rail-badge"/></IconButton>

        <IconButton title="Calls" active={section==='calls'} onClick={()=>{setSection('calls');setMobileChat(false)}}><PhoneCall size={22}/></IconButton>

        <IconButton title="Updates" active={section==='status'} onClick={()=>{setSection('status');setMobileChat(false)}}><CircleDashed size={22}/></IconButton>

        <IconButton title="Communities" active={section==='channels'} onClick={()=>{setSection('channels');setMobileChat(false)}}><Users size={22}/></IconButton>

        <div className="rail-separator short"/>

        <IconButton title="Business tools" active={section==='tools'} onClick={()=>{setSection('tools');setMobileChat(false)}}><Store size={22}/></IconButton>

        <div className="rail-separator short"/>

        <button type="button" className={`assistant-rail ${activeId==='assistant'?'selected':''}`} title="MuseOps" onClick={openAssistant}>

          <span className="assistant-orbit"><Sparkles size={20}/></span>

          <span className="assistant-rail-dot"/>

        </button>

      </div>

      <div className="rail-bottom">

        <IconButton title="Settings"><Settings size={21}/></IconButton>

        <IconButton title="Help"><HelpCircle size={21}/></IconButton>

        <div className="my-profile">B</div>

      </div>

    </aside>



    <section className={`sidebar ${mobileChat?'hide-mobile':''}`}>

      <header className="sidebar-heading">

        <h1>{section==='chats'?'WhatsApp Business':section==='status'?'Updates':section==='calls'?'Calls':section==='tools'?'Business tools':'Channels'}</h1>

        <div className="sidebar-heading-actions">

          <IconButton title="New chat"><MessageSquarePlus size={21}/></IconButton>

          <div className="menu-anchor">

            <IconButton title="Menu" onClick={()=>setShowMenu(v=>!v)}><MoreVertical size={21}/></IconButton>

            {showMenu && <div className="dropdown-menu"><button>New group</button><button>Starred messages</button><button>Business tools</button><button>Settings</button></div>}

          </div>

        </div>

      </header>

      <div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search or start a new chat"/><button title="Filter chats"><Filter size={16}/></button></div>

      <div className="chat-filters">

        {[['all','All'],['unread','Unread'],['favorites','Favorites'],['groups','Groups']].map(([id,label])=><button key={id} onClick={()=>setFilter(id)} className={filter===id?'chosen':''}>{label}</button>)}

      </div>

      <div className="chat-list-scroll">

        <div className="list-divider-label"><span>Recent</span></div>

        {visibleChats.map(chat=><button key={chat.id} className={`chat-item ${activeId===chat.id?'active':''}`} onClick={()=>selectChat(chat.id)}>

          <Avatar chat={chat}/>

          <div className="chat-copy">

            <div className="chat-line"><strong>{chat.name}</strong><time className={chat.unread?'unread-time':''}>{chat.time}</time></div>

            <div className="chat-preview"><span>{chat.preview}</span>{chat.unread>0?<b className="unread-count">{chat.unread}</b>:chat.type==='group'?<Users size={13} className="preview-icon"/>:null}</div>

          </div>

        </button>)}

        {visibleChats.length===0 && <div className="empty-list">No chats found</div>}

      </div>

      <div className="sidebar-bottom-note"><span className="tiny-lock">●</span> <span>Demo workspace · Sample conversations</span></div>

    </section>



    <main className={`chat-main ${!mobileChat?'show-mobile-empty':''}`}>

      {section!=='chats' ? <SectionPlaceholder section={section}/> : <>

        <header className="chat-header">

          <button className="back-mobile" onClick={()=>setMobileChat(false)}><ArrowLeft size={21}/></button>

          <Avatar chat={active} size="header-avatar"/>

          <div className="header-contact"><strong>{active.name}</strong><span>{active.type==='assistant'?'Business Operations Assistant':active.type==='supplier'?'supplier':active.type==='group'?'Group · '+active.name:'last seen today at 2:39 pm'}</span></div>

          <div className="header-actions">

            <button className="video-action"><Video size={18}/><span>Video</span><ChevronDown size={14}/></button>

            <IconButton title="Search in conversation" onClick={()=>setShowChatSearch(v=>!v)}><Search size={20}/></IconButton>

            <IconButton title="More options" onClick={()=>setShowMenu(v=>!v)}><MoreVertical size={21}/></IconButton>

          </div>

        </header>

        {showChatSearch && <div className="inline-chat-search"><Search size={16}/><input autoFocus placeholder="Search messages"/><IconButton title="Close search" onClick={()=>setShowChatSearch(false)}><X size={17}/></IconButton></div>}

        <div className={`messages-scroll ${active.type==='assistant' && active.messages.length===0 ? 'assistant-empty' : ''}`} key={activeId}>

          {active.type!=='assistant' && <><div className="encryption-notice"><span className="lock-mini">▣</span> This is a demo conversation. Messages are stored locally in this prototype. </div><div className="today-pill">TODAY</div></>}

          {active.messages.map((m,i)=><Message key={`${activeId}-${i}`} message={m}/>)}

          {active.type === 'assistant' && isAssistantThinking && (<div className="message-line"><div className="bubble incoming-bubble">MuseOps is thinking...</div></div>)}

        </div>

        <footer className="message-composer">

          <IconButton title="Emoji"><Smile size={23}/></IconButton>

          <IconButton title="Attach file" onClick={()=>fileRef.current?.click()}><Paperclip size={22}/></IconButton>

          <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" hidden onChange={handleFile}/>

          <input className="message-input" value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} placeholder="Type a message"/>

          {draft.trim()?<button className="send-action" onClick={sendMessage} title="Send"><Send size={19}/></button>:<IconButton title="Voice message"><Mic size={22}/></IconButton>}

        </footer>

      </>}

    </main>

    <div className="bottom-brand">Independent hackathon prototype · Not connected to WhatsApp</div>

  </div>;

}




function Message({ message: m }) {
  const result = m.invoiceResult;
  const invoice = result?.parsedInvoice;
  const matching = result?.matchingResult;

  const isMatched = matching?.status === "matched";

  const formatCurrency = (value) =>
    value == null
      ? "—"
      : `₹${Number(value).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

  const formatNumber = (value) =>
    value == null ? "—" : Number(value).toLocaleString("en-IN");

  const formatQuantity = (value, unit) =>
    `${formatNumber(value)}${unit ? ` ${unit}` : ""}`;

  const checkLabels = [
    ["quantityMatches", "Quantity"],
    ["unitMatches", "Unit"],
    ["rateMatches", "Price reference"],
    ["lineAmountMatches", "Line amount"],
  ];

  return (
    <div className={`message-line ${m.from === "me" ? "outgoing-line" : ""}`}>
      <div
        className={`bubble ${
          m.from === "me" ? "outgoing-bubble" : "incoming-bubble"
        }`}
      >
        {m.name && <div className="group-sender">{m.name}</div>}

        {m.attachment === "invoice" && (
          <div className="attachment-card">
            <div className="pdf-icon">
              <FileText size={22} />
            </div>
            <div>
              <b>{m.text || "Invoice document"}</b>
              <span>Invoice attachment</span>
            </div>
          </div>
        )}

        {m.attachment === "image" && (
          <div className="attachment-card">
            <div className="image-icon">
              <ImageIcon size={22} />
            </div>
            <div>
              <b>Image attached</b>
              <span>Photo attachment</span>
            </div>
          </div>
        )}

        {m.attachment === "file" && (
          <div className="attachment-card">
            <div className="pdf-icon">
              <FileText size={22} />
            </div>
            <div>
              <b>{m.text}</b>
              <span>Document attached</span>
            </div>
          </div>
        )}

        {!m.attachment && <span>{m.text}</span>}

        {result && (
          <div className="invoice-result-card">
            <div className="invoice-result-header">
              <div>
                <span className="invoice-eyebrow">
                  MUSEOPS INVOICE CHECK
                </span>
                <h3>Invoice analysis</h3>
              </div>

              <span
                className={`invoice-status ${
                  isMatched ? "matched" : "discrepancy"
                }`}
              >
                {isMatched ? "Matched" : "Discrepancy"}
              </span>
            </div>

            <div className="invoice-details-grid">
              <div>
                <span>Supplier</span>
                <strong>{invoice?.supplier || "Not detected"}</strong>
              </div>

              <div>
                <span>Invoice number</span>
                <strong>{invoice?.invoiceNumber || "Not detected"}</strong>
              </div>

              <div>
                <span>Purchase order</span>
                <strong>{invoice?.purchaseOrder || "Not detected"}</strong>
              </div>

              <div>
                <span>Invoice total</span>
                <strong>{formatCurrency(invoice?.total)}</strong>
              </div>
            </div>

            <div className="invoice-extraction">
              <span>Extraction method</span>
              <strong>
                {result.extractionMethod === "tesseract.js"
                  ? "Image OCR"
                  : result.extractionMethod || "Document extraction"}
              </strong>

              {result.ocrConfidence != null && (
                <span>
                  {" "}· {Math.round(result.ocrConfidence)}% confidence
                </span>
              )}
            </div>

            {matching?.itemResults?.length > 0 && (
              <div className="invoice-items">
                <h4>Purchase order comparison</h4>

                {matching.itemResults.map((item, index) => {
                  const itemMatched = item.status === "matched";
                  const itemChecks = item.checks;

                  return (
                    <div className="invoice-comparison-item" key={index}>
                      <div className="invoice-item-heading">
                        <strong>
                          {item.productName ||
                            item.invoiceItem ||
                            `Item ${index + 1}`}
                        </strong>

                        <span
                          className={`invoice-item-status ${
                            itemMatched ? "matched" : "discrepancy"
                          }`}
                        >
                          {itemMatched ? "Matched" : "Review"}
                        </span>
                      </div>

                      {item.invoice && item.purchaseOrder && (
                        <>
                          <div className="invoice-comparison-grid">
                            <div className="comparison-column">
                              <span className="comparison-label">
                                INVOICE
                              </span>

                              <div>
                                <span>Quantity</span>
                                <strong>
                                  {formatQuantity(
                                    item.invoice.quantity,
                                    item.invoice.unit
                                  )}
                                </strong>
                              </div>

                              <div>
                                <span>Rate</span>
                                <strong>
                                  {formatCurrency(item.invoice.rate)}
                                </strong>
                              </div>

                              <div>
                                <span>Line amount</span>
                                <strong>
                                  {formatCurrency(item.invoice.amount)}
                                </strong>
                              </div>
                            </div>

                            <div className="comparison-column">
                              <span className="comparison-label">
                                PURCHASE ORDER
                              </span>

                              <div>
                                <span>Quantity</span>
                                <strong>
                                  {formatQuantity(
                                    item.purchaseOrder.quantity,
                                    item.purchaseOrder.unit
                                  )}
                                </strong>
                              </div>

                              <div>
                                <span>Reference rate</span>
                                <strong>
                                  {formatCurrency(
                                    item.purchaseOrder.referenceRate
                                  )}
                                </strong>
                              </div>

                              <div>
                                <span>Expected amount*</span>
                                <strong>
                                  {formatCurrency(
                                    Number(item.purchaseOrder.quantity) *
                                      Number(item.purchaseOrder.referenceRate)
                                  )}
                                </strong>
                              </div>
                            </div>
                          </div>

                          {itemChecks && (
                            <div className="invoice-check-list">
                              {checkLabels.map(([key, label]) => (
                                <div className="invoice-check-row" key={key}>
                                  <span>{label}</span>
                                  <strong
                                    className={
                                      itemChecks[key]
                                        ? "check-passed"
                                        : "check-failed"
                                    }
                                  >
                                    {itemChecks[key] ? "Passed" : "Failed"}
                                  </strong>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {item.discrepancies?.length > 0 && (
                        <div className="invoice-item-issues">
                          {item.discrepancies.map((issue, issueIndex) => (
                            <div key={issueIndex}>{issue}</div>
                          ))}
                        </div>
                      )}

                      {item.status === "unmatched" && (
                        <div className="invoice-item-issues">
                          Product not found in business records.
                        </div>
                      )}

                      {item.status === "not_in_purchase_order" && (
                        <div className="invoice-item-issues">
                          Product is not included in this purchase order.
                        </div>
                      )}
                    </div>
                  );
                })}

                <span className="invoice-footnote">
                  *Expected amount is calculated using the reference purchase
                  rate, not a separately negotiated PO price.
                </span>
              </div>
            )}

            {matching?.totals && (
              <div className="invoice-total-checks">
                <h4>Invoice total validation</h4>

                <div>
                  <span>Subtotal</span>
                  <strong>
                    {formatCurrency(matching.totals.invoiceSubtotal)}
                  </strong>
                </div>

                <div>
                  <span>Calculated subtotal</span>
                  <strong>
                    {formatCurrency(matching.totals.calculatedSubtotal)}
                  </strong>
                </div>

                <div>
                  <span>GST</span>
                  <strong>
                    {formatCurrency(matching.totals.invoiceGST)}
                  </strong>
                </div>

                <div>
                  <span>Invoice total</span>
                  <strong>
                    {formatCurrency(matching.totals.invoiceTotal)}
                  </strong>
                </div>

                <div className="invoice-check-row">
                  <span>Subtotal validation</span>
                  <strong
                    className={
                      matching.totals.subtotalMatches
                        ? "check-passed"
                        : "check-failed"
                    }
                  >
                    {matching.totals.subtotalMatches ? "Passed" : "Failed"}
                  </strong>
                </div>

                <div className="invoice-check-row">
                  <span>Total validation</span>
                  <strong
                    className={
                      matching.totals.totalMatches
                        ? "check-passed"
                        : "check-failed"
                    }
                  >
                    {matching.totals.totalMatches ? "Passed" : "Failed"}
                  </strong>
                </div>
              </div>
            )}

            {matching?.discrepancies?.length > 0 && (
              <div className="invoice-alert">
                <strong>Discrepancies found</strong>
                <ul>
                  {matching.discrepancies.map((issue, index) => (
                    <li key={index}>
                      {typeof issue === "string"
                        ? issue
                        : issue.message || JSON.stringify(issue)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(matching?.warnings?.length > 0 ||
              result.parsingWarnings?.length > 0) && (
              <div className="invoice-alert">
                <strong>Warnings</strong>
                <ul>
                  {[
                    ...(matching?.warnings || []),
                    ...(result.parsingWarnings || []),
                  ].map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="invoice-approval">
              <div>
                <strong>Human approval required</strong>
                <span>
                  {matching?.inventoryUpdated
                    ? "Inventory update recorded."
                    : "Inventory has not been updated."}
                </span>
              </div>

              <span className="approval-indicator">
                {matching?.approvalRequired ? "Pending" : "Review"}
              </span>
            </div>
          </div>
        )}

        <div className="bubble-meta">
          <time>{m.time}</time>
          {m.from === "me" && (
            <CheckCheck size={15} className="blue-ticks" />
          )}
        </div>
      </div>
    </div>
  );
}


function SectionPlaceholder({section}) {

  const content = section==='status' ? ['Updates','Share text and photo updates with your contacts.'] : section==='calls' ? ['Calls','Your recent voice and video calls will appear here.'] : section==='tools' ? ['Business tools','Manage your catalogue, orders and business profile.'] : ['Channels','Follow channels to get updates from people and organisations.'];

  return <div className="section-placeholder"><div className="placeholder-art"><CircleDashed size={54}/></div><h2>{content[0]}</h2><p>{content[1]}</p></div>;

}

function LockIcon(){return <span className="tiny-lock">▣</span>}



createRoot(document.getElementById('root')).render(<App/>);
