const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  REST,
  Routes
} = require("discord.js");

// ===============================
// إعداد البوت
// ===============================

const TOKEN = process.env.DISCORD_TOKEN;

// Application ID
const CLIENT_ID = "1552623061373550633";

// Server ID
const GUILD_ID = "1552625064309166161";

if (!TOKEN) {
  console.error("❌ لم يتم العثور على DISCORD_TOKEN في Railway Variables");
  process.exit(1);
}

// ===============================
// تشغيل البوت
// ===============================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ===============================
// أوامر البوت
// ===============================

const commands = [

  new SlashCommandBuilder()
    .setName("rules")
    .setDescription("عرض قوانين السيرفر"),

  new SlashCommandBuilder()
    .setName("server")
    .setDescription("معلومات السيرفر"),

  new SlashCommandBuilder()
    .setName("setup")
    .setDescription("تجهيز السيرفر تلقائياً"),

  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("مسح الرسائل")
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("عدد الرسائل")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("طرد عضو")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("العضو")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("حظر عضو")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("العضو")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("clan")
    .setDescription("عرض معلومات كلان")
    .addStringOption(option =>
      option
        .setName("name")
        .setDescription("اسم الكلان")
        .setRequired(true)
    )

].map(command => command.toJSON());

// ===============================
// إنشاء Category
// ===============================

async function getOrCreateCategory(guild, name) {

  let category = guild.channels.cache.find(
    channel =>
      channel.name === name &&
      channel.type === ChannelType.GuildCategory
  );

  if (!category) {

    category = await guild.channels.create({
      name: name,
      type: ChannelType.GuildCategory
    });

  }

  return category;
}

// ===============================
// إنشاء Text Channel
// ===============================

async function getOrCreateChannel(guild, name, parent) {

  let channel = guild.channels.cache.find(
    c =>
      c.name === name &&
      c.type === ChannelType.GuildText
  );

  if (!channel) {

    channel = await guild.channels.create({
      name: name,
      type: ChannelType.GuildText,
      parent: parent?.id
    });

  }

  return channel;
}

// ===============================
// تجهيز السيرفر
// ===============================

async function setupServer(guild) {

  console.log("⚙️ بدء تجهيز سيرفر Mount & Blade...");

  // Categories
  const infoCategory =
    await getOrCreateCategory(
      guild,
      "🏰・مملكة Mount & Blade"
    );

  const staffCategory =
    await getOrCreateCategory(
      guild,
      "🛡️・الإدارة"
    );

  const supportCategory =
    await getOrCreateCategory(
      guild,
      "🎫・الدعم"
    );

  // Channels
  const welcome =
    await getOrCreateChannel(
      guild,
      "welcome",
      infoCategory
    );

  const rules =
    await getOrCreateChannel(
      guild,
      "rules",
      infoCategory
    );

  const announcements =
    await getOrCreateChannel(
      guild,
      "announcements",
      infoCategory
    );

  const tickets =
    await getOrCreateChannel(
      guild,
      "tickets",
      supportCategory
    );

  await getOrCreateChannel(
    guild,
    "staff-chat",
    staffCategory
  );

  // ===============================
  // الرتب
  // ===============================

  const roles = [

    "👑・Owner",
    "🛡️・Admin",
    "⚔️・Moderator",
    "🏰・Clan Leader",
    "🎖️・Member"

  ];

  for (const roleName of roles) {

    const exists =
      guild.roles.cache.some(
        role => role.name === roleName
      );

    if (!exists) {

      await guild.roles.create({
        name: roleName,
        reason: "Mount & Blade Auto Setup"
      });

      console.log(`✅ تم إنشاء رتبة ${roleName}`);

    }

  }

  // ===============================
  // القوانين
  // ===============================

  if (rules.messages.cache.size === 0) {

    const rulesEmbed =
      new EmbedBuilder()
        .setTitle("📜 قوانين مملكة Mount & Blade")
        .setDescription(
`
⚔️ **قوانين السيرفر**

1️⃣ احترام جميع الأعضاء.

2️⃣ ممنوع السب والشتم.

3️⃣ ممنوع السبام والإزعاج.

4️⃣ ممنوع التخريب.

5️⃣ الالتزام بتعليمات الإدارة.

6️⃣ ممنوع نشر روابط مشبوهة.

7️⃣ استخدم التذاكر للدعم والمشاكل.

8️⃣ استمتع باللعب وحافظ على روح المنافسة.
`
        )
        .setTimestamp();

    await rules.send({
      embeds: [rulesEmbed]
    });

  }

  // ===============================
  // رسالة الترحيب
  // ===============================

  if (welcome.messages.cache.size === 0) {

    const welcomeEmbed =
      new EmbedBuilder()
        .setTitle("⚔️ أهلاً بك في المملكة!")
        .setDescription(
`
مرحباً بك 👋

🏰 نورت سيرفر **Mount & Blade**

📜 اقرأ القوانين
⚔️ شارك في الكلانات
🎫 استخدم التذاكر عند الحاجة

نتمنى لك وقتاً ممتعاً!
`
        )
        .setTimestamp();

    await welcome.send({
      embeds: [welcomeEmbed]
    });

  }

  // ===============================
  // التذاكر
  // ===============================

  if (tickets.messages.cache.size === 0) {

    const ticketButton =
      new ActionRowBuilder().addComponents(

        new ButtonBuilder()
          .setCustomId("open_ticket")
          .setLabel("🎫 فتح تذكرة")
          .setStyle(ButtonStyle.Primary)

      );

    const ticketEmbed =
      new EmbedBuilder()
        .setTitle("🎫 الدعم الفني")
        .setDescription(
          "اضغط الزر بالأسفل لفتح تذكرة مع الإدارة."
        );

    await tickets.send({
      embeds: [ticketEmbed],
      components: [ticketButton]
    });

  }

  console.log("✅ اكتمل تجهيز السيرفر!");

}

// ===============================
// عند تشغيل البوت
// ===============================

client.once("ready", async () => {

  console.log(
    `✅ البوت يعمل: ${client.user.tag}`
  );

  client.user.setPresence({

    activities: [
      {
        name: "Mount & Blade ⚔️",
        type: 0
      }
    ],

    status: "online"

  });

  try {

    // تسجيل الأوامر
    const rest =
      new REST({
        version: "10"
      }).setToken(TOKEN);

    await rest.put(

      Routes.applicationGuildCommands(
        CLIENT_ID,
        GUILD_ID
      ),

      {
        body: commands
      }

    );

    console.log(
      "✅ تم تسجيل أوامر Slash."
    );

    // جلب السيرفر
    const guild =
      await client.guilds.fetch(GUILD_ID);

    // التجهيز
    await setupServer(guild);

  } catch (error) {

    console.error(
      "❌ حدث خطأ:",
      error
    );

  }

});

// ===============================
// ترحيب بالأعضاء
// ===============================

client.on(
  "guildMemberAdd",
  async member => {

    const channel =
      member.guild.channels.cache.find(
        channel =>
          channel.name === "welcome" &&
          channel.type === ChannelType.GuildText
      );

    if (!channel) return;

    const embed =
      new EmbedBuilder()
        .setTitle("⚔️ أهلاً بك!")
        .setDescription(
`
مرحباً ${member} 👋

نورت سيرفر **Mount & Blade** 🏰

📜 اقرأ القوانين
⚔️ استمتع معنا
🎫 افتح تذكرة إذا احتجت مساعدة
`
        )
        .setThumbnail(
          member.user.displayAvatarURL()
        )
        .setTimestamp();

    await channel.send({
      embeds: [embed]
    }).catch(() => {});

  }
);

// ===============================
// التفاعلات
// ===============================

client.on(
  "interactionCreate",
  async interaction => {

    // ===========================
    // فتح تذكرة
    // ===========================

    if (
      interaction.isButton() &&
      interaction.customId === "open_ticket"
    ) {

      const existing =
        interaction.guild.channels.cache.find(
          channel =>
            channel.name ===
            `ticket-${interaction.user.id}`
        );

      if (existing) {

        return interaction.reply({
          content:
            `🎫 لديك تذكرة مفتوحة بالفعل: ${existing}`,
          ephemeral: true
        });

      }

      const ticketChannel =
        await interaction.guild.channels.create({

          name:
            `ticket-${interaction.user.id}`,

          type:
            ChannelType.GuildText,

          parent:
            interaction.channel.parentId,

          permissionOverwrites: [

            {
              id:
                interaction.guild.roles.everyone.id,

              deny: [
                PermissionsBitField.Flags.ViewChannel
              ]
            },

            {
              id:
                interaction.user.id,

              allow: [

                PermissionsBitField.Flags.ViewChannel,

                PermissionsBitField.Flags.SendMessages,

                PermissionsBitField.Flags.ReadMessageHistory

              ]
            }

          ]

        });

      const closeButton =
        new ActionRowBuilder().addComponents(

          new ButtonBuilder()

            .setCustomId("close_ticket")

            .setLabel("🔒 إغلاق التذكرة")

            .setStyle(
              ButtonStyle.Danger
            )

        );

      const embed =
        new EmbedBuilder()

          .setTitle("🎫 تذكرة الدعم")

          .setDescription(
            "اكتب مشكلتك هنا وسيتم الرد عليك من الإدارة."
          );

      await ticketChannel.send({

        content:
          `${interaction.user}`,

        embeds: [
          embed
        ],

        components: [
          closeButton
        ]

      });

      return interaction.reply({

        content:
          `✅ تم فتح التذكرة: ${ticketChannel}`,

        ephemeral: true

      });

    }

    // ===========================
    // إغلاق التذكرة
    // ===========================

    if (
      interaction.isButton() &&
      interaction.customId === "close_ticket"
    ) {

      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageChannels
        )
      ) {

        return interaction.reply({

          content:
            "❌ تحتاج صلاحية Manage Channels.",

          ephemeral: true

        });

      }

      await interaction.reply(
        "🔒 سيتم إغلاق التذكرة..."
      );

      setTimeout(() => {

        interaction.channel
          .delete()
          .catch(() => {});

      }, 1200);

      return;

    }

    // ===========================
    // Slash Commands
    // ===========================

    if (!interaction.isChatInputCommand())
      return;

    // ===========================
    // SETUP
    // ===========================

    if (
      interaction.commandName === "setup"
    ) {

      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageGuild
        )
      ) {

        return interaction.reply({

          content:
            "❌ هذا الأمر للإدارة فقط.",

          ephemeral: true

        });

      }

      await setupServer(
        interaction.guild
      );

      return interaction.reply({

        content:
          "✅ تم تجهيز السيرفر!",

        ephemeral: true

      });

    }

    // ===========================
    // RULES
    // ===========================

    if (
      interaction.commandName === "rules"
    ) {

      return interaction.reply({

        embeds: [

          new EmbedBuilder()

            .setTitle(
              "📜 قوانين السيرفر"
            )

            .setDescription(
`
⚔️ الاحترام
🚫 منع السبام
🚫 منع التخريب
🛡️ الالتزام بالإدارة
🎫 استخدام التذاكر للدعم
`
            )

        ]

      });

    }

    // ===========================
    // SERVER
    // ===========================

    if (
      interaction.commandName === "server"
    ) {

      return interaction.reply({

        embeds: [

          new EmbedBuilder()

            .setTitle(
              "🏰 Mount & Blade"
            )

            .setDescription(
`
⚔️ نظام الكلانات

🎖️ نظام الرتب

🎫 نظام التذاكر

🛡️ إدارة السيرفر

📜 القوانين

✨ تصميم مودرن
`
            )

        ]

      });

    }

    // ===========================
    // CLAN
    // ===========================

    if (
      interaction.commandName === "clan"
    ) {

      const clanName =
        interaction.options.getString(
          "name"
        );

      return interaction.reply({

        embeds: [

          new EmbedBuilder()

            .setTitle(
              "⚔️ معلومات الكلان"
            )

            .setDescription(
`
🏰 **الكلان:** ${clanName}

👑 **العضو:** ${interaction.user}
`
            )

        ]

      });

    }

    // ===========================
    // CLEAR
    // ===========================

    if (
      interaction.commandName === "clear"
    ) {

      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageMessages
        )
      ) {

        return interaction.reply({

          content:
            "❌ تحتاج Manage Messages.",

          ephemeral: true

        });

      }

      const amount =
        interaction.options.getInteger(
          "amount"
        );

      await interaction.channel.bulkDelete(
        amount,
        true
      );

      return interaction.reply({

        content:
          `🧹 تم مسح ${amount} رسالة.`,

        ephemeral: true

      });

    }

    // ===========================
    // KICK
    // ===========================

    if (
      interaction.commandName === "kick"
    ) {

      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.KickMembers
        )
      ) {

        return interaction.reply({

          content:
            "❌ تحتاج Kick Members.",

          ephemeral: true

        });

      }

      const user =
        interaction.options.getUser(
          "user"
        );

      const member =
        await interaction.guild.members.fetch(
          user.id
        );

      if (!member.kickable) {

        return interaction.reply({

          content:
            "❌ لا أستطيع طرد هذا العضو.",

          ephemeral: true

        });

      }

      await member.kick();

      return interaction.reply(
        `👢 تم طرد **${user.tag}**.`
      );

    }

    // ===========================
    // BAN
    // ===========================

    if (
      interaction.commandName === "ban"
    ) {

      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.BanMembers
        )
      ) {

        return interaction.reply({

          content:
            "❌ تحتاج Ban Members.",

          ephemeral: true

        });

      }

      const user =
        interaction.options.getUser(
          "user"
        );

      await interaction.guild.members.ban(
        user.id
      );

      return interaction.reply(
        `🔨 تم حظر **${user.tag}**.`
      );

    }

  }
);

// ===============================
// تسجيل الدخول
// ===============================

client.login(TOKEN);
