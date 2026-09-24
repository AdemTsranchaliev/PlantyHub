using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PlantyHub.Api.Data;

#nullable disable

namespace PlantyHub.Api.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260924150000_AddPromoCodeWindow")]
    public partial class AddPromoCodeWindow : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "StartsAt",
                table: "PromoCodes",
                type: "timestamp with time zone",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "StartsAt", table: "PromoCodes");
        }
    }
}
