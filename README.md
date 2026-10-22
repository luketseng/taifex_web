# TAIFEX WEB

This project provides a web frontend for chip analysis of the three major institutional investors in Taiwan's stock market.  
It integrates with other TAIFEX projects for data backup, automation, and infrastructure, offering a complete solution for data visualization and interactive queries.

## 🌐 Web Application

- The data backed up by this project is visualized and accessible via the TAIFEX Web frontend:  
  [http://zane.myftp.org/](http://zane.myftp.org/)

## 📝 Project Description

- **Goal:** Visualize and provide analytical tools for the legal entity (institutional investor) chip data from the Taiwan Futures Exchange (TAIFEX).
- **Tech Stack:** JavaScript, HTML, CSS, and Docker compatibility.

## 📂 Project Structure

```
taifex_web/
├── index.html           # Main webpage
├── style/               # Styles directory
├── data.json            # Chip data (symbolic link to external source)
├── data_MTX.json        # MTX futures data (symbolic link to external source)
├── FUT_TX.json          # TX futures data (symbolic link to external source)
└── ...                  # Other static resources
```

> ⚠️ Note: Data files are mostly symbolic links. Ensure the data sources are correctly configured.

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taifex_web
   ```

2. **Prepare data files**
   - Make sure `data.json`, `data_MTX.json`, and `FUT_TX.json` are symlinked or copied into the project root.
   - These files are usually updated and maintained by the [taifex_daily](../taifex_daily) project.

3. **Start a local server**
   - You can use a simple HTTP server, for example:
     ```bash
     python -m http.server 8080
     ```
   - Or deploy the web directory to your preferred web server (Apache/Nginx).

4. **Browse the web UI**
   - Visit `http://localhost:8080` or the corresponding server address in your browser to start using the chip analysis tool.

## 🛠️ Related Projects

- [taifex_daily](https://github.com/luketseng/taifex_daily): Handles daily data backup, automated downloads, and database management.
- [taifex_infra](https://github.com/luketseng/taifex_infra): Provides infrastructure for automated deployment and testing (Docker environment).

## 🔧 Deployment & Development Tips

- Place `taifex_web`, `taifex_daily`, and `taifex_infra` at the same directory level for easier integration and deployment.
- For Docker integration, see [taifex_infra](https://github.com/luketseng/taifex_infra) for docker-compose configuration and automation scripts.

## 🙋 FAQ

- **Data not showing up?**  
  Check that your data files (`data.json`, etc.) are correctly linked and being regularly updated.
- **How to automatically back up or update data?**  
  Refer to [taifex_daily](https://github.com/luketseng/taifex_daily) for backup instructions and crontab usage examples.

## 📃 License

[MIT](LICENSE)  
For questions or suggestions, please submit an Issue or Pull Request!

## Foreign position detail preview

The three position tracks read `web_json/foreign_positions.json`, matched to the
summary trading date. Data processing and export tools belong to `taifex_daily`.
For a manual export, run from the backend repository:

```bash
cd ~/git/taifex_daily
python3 -m lib.foreign_positions ./II_DB.db --date 2026/10/16 --output ../taifex_web/web_json/foreign_positions.json
```

The exporter opens SQLite read-only and lives in `taifex_daily/lib/foreign_positions.py`.
The daily `get_data.py` pipeline now exports the requested day after updating data,
using its working directory (the existing cron runs in `web_json/`). Existing
dates are preserved and repeat runs replace only the target date. Incomplete days
leave the file unchanged. Publication uses an atomic file replacement. Missing dates
show unavailable detail without blocking charts. Each track independently compares
buy-side and sell-side open interest; the blue buy segment and amber sell segment meet at the marker.
TXO CALL/PUT positions are kept separate from the headline TX net position.

Frontend regression checks stay in this repository (`node tests/metrics.cjs` and
`node tests/summary-disclosure.cjs`). Database and JSON export regression tests
belong to `taifex_daily/tests/`; see that repository's README for cron and test commands.
