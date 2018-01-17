import React, { Component, Fragment } from "react";
import { render } from "react-dom";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import AppBar from "material-ui/AppBar";
import Drawer from "material-ui/Drawer";
import Checkbox from "material-ui/Checkbox";
import MenuItem from "material-ui/MenuItem";
import RaisedButton from "material-ui/RaisedButton";
import Dropzone from "react-dropzone";
import savery from "savery";

import "./styles.css";

import CSVTable, { RowParser } from "./components/CSVTable";

class App extends Component {
	state = {
		header: true,
		drawerOpen: false,
		csvData: ``
	};
	handleMenu = () => {
		this.setState({ drawerOpen: true });
	};
	handleOption = (name, e, value) => {
		this.setState({
			[name]: value
		});
	};
	onDrop = acceptedFiles => {
		acceptedFiles.forEach(file => {
			const reader = new FileReader();
			reader.onload = () => {
				const fileAsBinaryString = reader.result;
				this.setState({ csvData: fileAsBinaryString });
			};
			reader.onabort = () => console.log("file reading was aborted");
			reader.onerror = () => console.log("file reading has failed");

			reader.readAsBinaryString(file);
		});
	};
	generateJSON = () => {
		let json = {};
		const { csvData, header } = this.state;
		if (header && csvData !== "") {
			const rows = csvData.split("\n").map(row => {
				return RowParser(row);
			});
			const headerRow = rows[0];
			json = rows.slice(1, rows.length - 1).map(row => {
				let obj = {};
				row.map((cell, index) => {
					obj[headerRow[index]] = cell;
				});
				return obj;
			});
		}
		return JSON.stringify(json, null, 2).replace(/\\r/g, "");
	};
	render() {
		return (
			<div>
				<MuiThemeProvider>
					<AppBar
						title="CSV Viewer"
						onLeftIconButtonClick={this.handleMenu}
						style={{ position: "fixed" }}
						iconElementRight={
							<div>
								{this.state.csvData !== "" && (
									<Fragment>
										<RaisedButton
											onClick={() => {
												this.setState({ csvData: "" });
											}}
											label="Clear Data"
										/>
										<RaisedButton
											label="Download as JSON"
											style={{ marginLeft: 10 }}
											onClick={() => {
												// this.generateJSON();
												savery.save(this.generateJSON(), "export.json");
											}}
										/>
									</Fragment>
								)}
							</div>
						}
					/>
					<div style={{ height: 64 }} />
					<Drawer
						docked={false}
						open={this.state.drawerOpen}
						onRequestChange={drawerOpen => this.setState({ drawerOpen })}
					>
						<MenuItem>Options</MenuItem>
						<Checkbox
							label="Header Row"
							style={{ padding: 15 }}
							defaultChecked={true}
							onCheck={this.handleOption.bind(null, "header")}
						/>
					</Drawer>
					{this.state.csvData === "" ? (
						<Dropzone
							style={{
								width: "100%",
								height: "100%",
								position: "fixed",
								top: 0,
								left: 0
							}}
							onDrop={this.onDrop}
						>
							<div
								style={{
									position: "absolute",
									top: "50%",
									left: "50%",
									transform: "translate(-50%, -50%)",
									fontFamily: "Roboto"
								}}
							>
								Drag CSV Here
							</div>
						</Dropzone>
					) : (
						<CSVTable data={this.state.csvData} header={this.state.header} />
					)}
				</MuiThemeProvider>
			</div>
		);
	}
}

render(<App />, document.getElementById("root"));
