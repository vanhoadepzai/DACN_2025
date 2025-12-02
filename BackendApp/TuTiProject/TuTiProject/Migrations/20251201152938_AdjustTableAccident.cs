using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TuTiProject.Migrations
{
    /// <inheritdoc />
    public partial class AdjustTableAccident : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DeviceId",
                table: "AccidentReports",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "EmployeeId",
                table: "AccidentReports",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "AccidentReports",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "AccidentReports",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeviceId",
                table: "AccidentReports");

            migrationBuilder.DropColumn(
                name: "EmployeeId",
                table: "AccidentReports");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "AccidentReports");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "AccidentReports");
        }
    }
}
