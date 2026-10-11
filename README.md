# MyTube for Android

---

## 📢 中文说明：基于原作者项目的增强更新版

> 本仓库基于 **[franklioxygen/mytube-android](https://github.com/franklioxygen/mytube-android)**（原作者项目）更新而来，感谢原作者。以下是相对原版的全部更新内容（按提交拆分，均可单独查阅）。

### 1. 新增：启动密码锁（应用锁）

对齐 MyTube 桌面版的"启动密码锁"体验：

- 启用后每次启动应用先进入解锁界面，解锁后才能使用
- 应用切到后台超过 30 秒再回来会自动重新上锁
- 防暴力破解：连续输错 5 次，锁定 30 秒（带倒计时）
- 设置页可开启 / 修改 / 关闭（修改与关闭需验证当前密码），仅管理员角色可见
- 密码在设备本地加盐 + 12,000 次迭代哈希后存储，明文永不落盘
- 界面支持中文 / 英文 / 西语，跟随应用语言
- 忘记密码：清除应用数据即可重置（这是屏幕锁，不是安全边界）

### 2. 修复：语言设置无法保存

原版把语言选择存到服务端设置接口，但后端的设置保存白名单会丢弃 `language` 字段，导致每次重启都变回英文。现在语言选择**保存在设备本地**（MMKV），启动时自动恢复；界面三语可用。

### 3. 更换：应用启动图标

原版一直是 React Native 模板的默认安卓机器人图标。现替换为 MyTube 官方 logo 的全套图标：传统方形/圆形（5 个密度）+ Android 8+ 自适应图标（黑色背景与 logo 无缝衔接）。

### 4. 修复：react-native-mmkv v4 兼容

MMKV v4 移除了实例的 `delete()` 方法（改名 `remove()`），原版存储代码在触发清理路径时会直接崩溃。已加适配层，同时修复了后端地址存储模块的同类潜伏 bug。

### 5. 构建：Gradle 9 环境适配

- 移除与 Gradle 9 不兼容的 foojay-resolver-convention 插件（1.0.0 在 Gradle 9 下解析工具链必崩）
- 解除 daemon JVM 的 JETBRAINS 厂商钉死（Temurin JDK 21 亦可构建）
- 命令行构建需本机安装 JDK 21 + JDK 17 与 Android SDK，详见 `documents/build-from-source.md`

### 6. 其他

- 新增依赖：`js-sha256`（纯 JS 哈希，无原生模块）
- 与上游的功能与界面完全兼容，连接自托管 MyTube 后端的使用方式不变

---

（以下为原项目英文 README / The original English README follows.）

---

Android client for [**MyTube**](https://github.com/franklioxygen/mytube) — your self-hosted video library for YouTube, Bilibili, Twitch, MissAV, and other [yt-dlp-supported sites](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md). Stream your collections, manage downloads, and keep tabs on your subscriptions from your phone or tablet.

Built with React Native. Talks to a MyTube backend you host yourself.

[中文](README-zh.md)

## Screenshots

**Tablet**

<table>
  <tr>
    <td width="50%"><img src="https://github.com/user-attachments/assets/37c6d7a0-ddbf-458b-b565-4273d018809c" alt="Tablet — library" /></td>
    <td width="50%"><img src="https://github.com/user-attachments/assets/8c28f3c7-6fda-4c4f-bcc8-fc642d2b9d05" alt="Tablet — video detail" /></td>
  </tr>
</table>

**Phone**

<table>
  <tr>
    <td align="center" width="50%"><img src="https://github.com/user-attachments/assets/778b78de-a000-4fff-b3fb-05b452f405d2" alt="Phone — library" width="280" /></td>
    <td align="center" width="50%"><img src="https://github.com/user-attachments/assets/cbd67ed1-cf84-4eb4-9e1a-e487a741fa66" alt="Phone — video detail" width="280" /></td>
  </tr>
</table>

---

## What you can do

- **Browse and play** your MyTube library with rating, view counts, and resume position.
- **Search and filter** videos by source, author, tags, and collection.
- **Manage collections** — create, add, remove, and delete.
- **Watch subscriptions** — see what your subscribed YouTube/Bilibili/Twitch channels are auto-downloading.
- **See download status** — pending, active, history.
- **Cast-friendly UI** with subtitles, loop, fullscreen, and variable playback speed.
- **Login protection** — supports MyTube's admin/visitor passwords and passkeys.
- **Tablet layout** — adapts for larger screens with a side menu.

---

## Requirements

Before installing the app, you need:

1. **An Android device** running Android 7.0 (Nougat, API 24) or newer.
2. **A running MyTube backend** that the device can reach over the network. See the [MyTube setup guide](https://github.com/franklioxygen/mytube#getting-started) to install it (Docker recommended).
3. **A URL pointing to that backend** — either an HTTPS public URL (e.g. via [Cloudflare Tunnel](https://github.com/franklioxygen/mytube#cloudflare-tunnel) — built into MyTube) or a LAN address like `http://192.168.1.50:5551` if you only use it on your home network.

> **Tip:** If you use MyTube's built-in Cloudflare Tunnel, you'll get a free HTTPS URL like `https://mytube.example.com` that works from anywhere. That's the simplest path for using this app outside your home Wi-Fi.

---

## Install

1. Download the latest APK from the [Releases page](https://github.com/franklioxygen/mytube-android/releases).
2. On your Android device, open the file and tap **Install**. You may need to allow installation from unknown sources for your browser or file manager.
3. Open **MyTube** from your app drawer.

> Google Play distribution is not currently available. The app is installed by sideloading the signed APK.

---

## First-time setup — connect to your MyTube backend

When you launch the app for the first time you'll see the **Backend URL** screen. This is where you point the app at your MyTube server.

1. Enter the URL of your MyTube backend.
   - **HTTPS public URL** (recommended): `https://mytube.example.com`
   - **Local network**: `http://192.168.1.50:5551` (replace with your server's LAN IP and port)
   - Do **not** include a trailing `/api` — the app appends that for you.
2. Tap **Test connection**. A green check means the server is reachable.
3. Tap **Save**. You'll be taken to the login screen (if your MyTube has login protection enabled) or directly to the library.
4. Log in with the admin or visitor password set in your MyTube settings, or use a registered passkey.

You can change the backend URL later by clearing the app's data, or via the in-app settings (depending on your MyTube role).

---

## Documentation

- [Setup guide](documents/setup.md) — full step-by-step for installing the app and connecting to MyTube.
- [Build from source](documents/build-from-source.md) — for developers and contributors.
- [Troubleshooting](documents/troubleshooting.md) — common issues and fixes.

---

## Build from source

If you'd rather build the APK yourself or contribute:

```sh
git clone https://github.com/franklioxygen/mytube-android.git
cd mytube-android
npm install
npm run android   # boots Metro and installs on a connected device/emulator
```

See [documents/build-from-source.md](documents/build-from-source.md) for prerequisites (Node, JDK 21, Android SDK), per-machine configuration (the `nodeBinary` gradle property for Android Studio launches), and how to produce a release APK.

---

## Related projects

- **[MyTube](https://github.com/franklioxygen/mytube)** — the backend + web frontend this app talks to. Self-hosted, Docker-ready, open source.
- **[MyTube Chrome extension](https://github.com/franklioxygen/mytube/tree/master/chrome-extension)** — queue downloads from any browser tab.

## License

See [LICENSE](LICENSE) in the repository root.
