const { Client, GatewayIntentBits, PermissionsBitField, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, REST, Routes } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const { DISCORD_TOKEN: TOKEN, CLIENT_ID, GUILD_ID } = process.env;
if (!TOKEN || !CLIENT_ID || !GUILD_ID) process.exit(1);
const commands = [
 new SlashCommandBuilder().setName('rules').setDescription('عرض القوانين'),
 new SlashCommandBuilder().setName('server').setDescription('معلومات السيرفر'),
 new SlashCommandBuilder().setName('setup').setDescription('تجهيز الترحيب والتذاكر'),
 new SlashCommandBuilder().setName('clear').setDescription('مسح الرسائل').addIntegerOption(o=>o.setName('amount').setDescription('العدد').setRequired(true).setMinValue(1).setMaxValue(100)),
 new SlashCommandBuilder().setName('kick').setDescription('طرد عضو').addUserOption(o=>o.setName('user').setDescription('العضو').setRequired(true)),
 new SlashCommandBuilder().setName('ban').setDescription('حظر عضو').addUserOption(o=>o.setName('user').setDescription('العضو').setRequired(true)),
 new SlashCommandBuilder().setName('clan').setDescription('معلومات كلان').addStringOption(o=>o.setName('name').setDescription('اسم الكلان').setRequired(true))
].map(x=>x.toJSON());
async function register(){const rest=new REST({version:'10'}).setToken(TOKEN); await rest.put(Routes.applicationGuildCommands(CLIENT_ID,GUILD_ID),{body:commands});}
client.once('ready',async()=>{console.log(`✅ ${client.user.tag}`); client.user.setPresence({activities:[{name:'Mount & Blade ⚔️',type:0}],status:'online'}); try{await register();console.log('✅ Commands registered')}catch(e){console.error(e)}});
client.on('guildMemberAdd',async m=>{const c=m.guild.channels.cache.find(x=>x.name==='welcome'&&x.type===ChannelType.GuildText);if(c)c.send({embeds:[new EmbedBuilder().setTitle('⚔️ أهلاً بك في المملكة!').setDescription(`مرحباً ${m} 👋\nنورت سيرفر **Mount & Blade**!`).setThumbnail(m.user.displayAvatarURL())]}).catch(()=>{});});
client.on('interactionCreate',async i=>{
 if(i.isButton()&&i.customId==='open_ticket'){const old=i.guild.channels.cache.find(c=>c.name===`ticket-${i.user.id}`);if(old)return i.reply({content:`🎫 عندك تذكرة: ${old}`,ephemeral:true});const c=await i.guild.channels.create({name:`ticket-${i.user.id}`,type:ChannelType.GuildText,permissionOverwrites:[{id:i.guild.roles.everyone.id,deny:[PermissionsBitField.Flags.ViewChannel]},{id:i.user.id,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages,PermissionsBitField.Flags.ReadMessageHistory]}]});const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close_ticket').setLabel('إغلاق التذكرة').setStyle(ButtonStyle.Danger));await c.send({content:`${i.user}`,embeds:[new EmbedBuilder().setTitle('🎫 تذكرة الدعم').setDescription('اكتب مشكلتك هنا.')],components:[row]});return i.reply({content:`✅ فتحت: ${c}`,ephemeral:true});}
 if(i.isButton()&&i.customId==='close_ticket'){if(!i.member.permissions.has(PermissionsBitField.Flags.ManageChannels))return i.reply({content:'❌ تحتاج Manage Channels.',ephemeral:true});await i.reply('🔒 سيتم الإغلاق...');setTimeout(()=>i.channel.delete().catch(()=>{}),1000);return;}
 if(!i.isChatInputCommand())return;
 if(i.commandName==='rules')return i.reply({embeds:[new EmbedBuilder().setTitle('📜 قوانين المملكة').setDescription('1️⃣ الاحترام\n2️⃣ ممنوع السب والشتم\n3️⃣ ممنوع التخريب\n4️⃣ ممنوع السبام\n5️⃣ الالتزام بالإدارة')]});
 if(i.commandName==='server')return i.reply({embeds:[new EmbedBuilder().setTitle('🏰 Mount & Blade').setDescription('⚔️ كلانات\n🎖️ رتب\n🎫 تذاكر\n🛡️ إدارة\n📜 قوانين')]});
 if(i.commandName==='clan'){const n=i.options.getString('name');return i.reply({embeds:[new EmbedBuilder().setTitle('⚔️ Clan').setDescription(`🏰 **الكلان:** ${n}\n👑 **العضو:** ${i.user}`)]});}
 if(i.commandName==='clear'){if(!i.member.permissions.has(PermissionsBitField.Flags.ManageMessages))return i.reply({content:'❌ تحتاج Manage Messages.',ephemeral:true});const n=i.options.getInteger('amount');await i.channel.bulkDelete(n,true);return i.reply({content:`🧹 تم مسح ${n} رسالة.`,ephemeral:true});}
 if(i.commandName==='kick'){if(!i.member.permissions.has(PermissionsBitField.Flags.KickMembers))return i.reply({content:'❌ تحتاج Kick Members.',ephemeral:true});const u=i.options.getUser('user'),m=await i.guild.members.fetch(u.id);if(!m.kickable)return i.reply({content:'❌ لا أستطيع طرده.',ephemeral:true});await m.kick();return i.reply(`👢 تم طرد **${u.tag}**.`);}
 if(i.commandName==='ban'){if(!i.member.permissions.has(PermissionsBitField.Flags.BanMembers))return i.reply({content:'❌ تحتاج Ban Members.',ephemeral:true});const u=i.options.getUser('user');await i.guild.members.ban(u.id);return i.reply(`🔨 تم حظر **${u.tag}**.`);}
 if(i.commandName==='setup'){if(!i.member.permissions.has(PermissionsBitField.Flags.ManageGuild))return i.reply({content:'❌ للإدارة فقط.',ephemeral:true});let w=i.guild.channels.cache.find(c=>c.name==='welcome'&&c.type===ChannelType.GuildText);if(!w)w=await i.guild.channels.create({name:'welcome',type:ChannelType.GuildText});let t=i.guild.channels.cache.find(c=>c.name==='tickets'&&c.type===ChannelType.GuildText);if(!t)t=await i.guild.channels.create({name:'tickets',type:ChannelType.GuildText});const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('open_ticket').setLabel('🎫 فتح تذكرة').setStyle(ButtonStyle.Primary));await t.send({embeds:[new EmbedBuilder().setTitle('🎫 الدعم الفني').setDescription('اضغط الزر لفتح تذكرة.')],components:[row]});return i.reply({content:`✅ تم تجهيز ${w} و ${t}.`,ephemeral:true});}
});
client.login(TOKEN);
