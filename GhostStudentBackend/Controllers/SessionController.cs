using GhostStudentBackend.Data;
using GhostStudentBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GhostStudentBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SessionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SessionController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/session/heartbeat
        // Student browser sends score + status every 5 seconds
        [HttpPost("heartbeat")]
        public async Task<IActionResult> Heartbeat([FromBody] StudentSession payload)
        {
            var session = await _context.StudentSessions
                .FirstOrDefaultAsync(s => s.SessionId == payload.SessionId);

            if (session == null)
            {
                payload.LastUpdated = DateTime.UtcNow;
                _context.StudentSessions.Add(payload);
            }
            else
            {
                session.Score = payload.Score;
                session.IsPresent = payload.IsPresent;
                session.LastUpdated = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        // GET: api/session/radar
        // Teacher dashboard polls this to get all active students
        [HttpGet("radar")]
        public async Task<IActionResult> GetRadar()
        {
            var activeThreshold = DateTime.UtcNow.AddMinutes(-1);
            var students = await _context.StudentSessions
                .AsNoTracking()
                .Where(s => s.LastUpdated >= activeThreshold)
                .OrderBy(s => s.Score)
                .ToListAsync();

            return Ok(students);
        }
    }
}
