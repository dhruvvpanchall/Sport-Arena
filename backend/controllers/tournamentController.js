const Tournament = require('../models/tournament');
const User = require('../models/user');

// @GET /api/tournaments — Get all tournaments (includes registration count + user's registration status if logged in)
const getAllTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find().sort({ startDate: 1 });
    const userId = req.user?.id;
    const result = tournaments.map((t) => {
      const obj = t.toObject();
      obj.registrationCount = obj.registrations?.length || 0;
      obj.isRegistered = userId ? obj.registrations.some((r) => r.user.toString() === userId) : false;
      delete obj.registrations;
      return obj;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/tournaments/:id — Public: get single tournament details
const getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    const obj = tournament.toObject();
    obj.registrationCount = obj.registrations?.length || 0;
    const userId = req.user?.id;
    obj.isRegistered = userId ? obj.registrations.some((r) => r.user.toString() === userId) : false;
    delete obj.registrations;
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/tournaments/registered — User: get tournaments user is registered for
const getRegisteredTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find({ 'registrations.user': req.user.id }).sort({ startDate: 1 });
    const result = tournaments.map((t) => {
      const obj = t.toObject();
      obj.registrationCount = obj.registrations?.length || 0;
      const myReg = obj.registrations.find((r) => r.user.toString() === req.user.id);
      obj.registeredAt = myReg?.registeredAt || null;
      obj.teamName = myReg?.teamName || '';
      obj.captainName = myReg?.captainName || '';
      obj.playerCount = myReg?.playerCount || 1;
      obj.paymentStatus = myReg?.paymentStatus || '';
      obj.amountPaid = myReg?.amountPaid || 0;
      obj.isRegistered = true;
      delete obj.registrations;
      return obj;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/tournaments/:id/register — User: withdraw from tournament
const withdrawFromTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    const regIndex = tournament.registrations.findIndex(
      (r) => r.user.toString() === req.user.id
    );
    if (regIndex === -1) {
      return res.status(400).json({ message: 'You are not registered for this tournament' });
    }

    if (tournament.status === 'ongoing' || tournament.status === 'completed') {
      return res.status(400).json({ message: 'Cannot withdraw from an ongoing or completed tournament' });
    }

    tournament.registrations.splice(regIndex, 1);
    await tournament.save();

    res.json({ message: 'Successfully withdrawn from tournament' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/tournaments/my — Organizer: get own tournaments
const getMyTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find({ organizer: req.user.id }).sort({ createdAt: -1 });
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/tournaments — Organizer: create tournament
const createTournament = async (req, res) => {
  const { title, sport, icon, startDate, endDate, location, maxTeams, prize, image, description, entryFee, status } = req.body;
  try {
    const tournament = await Tournament.create({
      organizer: req.user.id,
      title,
      sport,
      icon: icon || '🏆',
      startDate,
      endDate,
      location,
      maxTeams,
      prize,
      image: image || '',
      description: description || '',
      entryFee: entryFee || 0,
      status: status || 'open',
    });
    res.status(201).json(tournament);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/tournaments/:id — Organizer: update tournament
const updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findOne({ _id: req.params.id, organizer: req.user.id });
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    const allowed = ['title', 'sport', 'icon', 'startDate', 'endDate', 'location', 'maxTeams', 'prize', 'image', 'description', 'entryFee', 'status'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) tournament[field] = req.body[field];
    });
    await tournament.save();
    res.json(tournament);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/tournaments/:id — Organizer: delete tournament
const deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findOneAndDelete({ _id: req.params.id, organizer: req.user.id });
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    res.json({ message: 'Tournament deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/tournaments/:id/register — User: register for tournament
const registerForTournament = async (req, res) => {
  const { teamName, captainName, phone, city, playerCount } = req.body;
  try {
    if (!teamName || !teamName.trim()) {
      return res.status(400).json({ message: 'Team name is required' });
    }
    if (!captainName || !captainName.trim()) {
      return res.status(400).json({ message: 'Captain name is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    if (tournament.status === 'closed' || tournament.status === 'completed') {
      return res.status(400).json({ message: 'Registration is closed for this tournament' });
    }

    if (tournament.registrations.length >= tournament.maxTeams) {
      return res.status(400).json({ message: 'Tournament is full' });
    }

    const alreadyRegistered = tournament.registrations.some(
      (r) => r.user.toString() === req.user.id
    );
    if (alreadyRegistered) {
      return res.status(400).json({ message: 'You are already registered' });
    }

    const user = await User.findById(req.user.id).select('email');
    const entryFee = tournament.entryFee || 0;

    tournament.registrations.push({
      user: req.user.id,
      teamName: teamName.trim(),
      captainName: captainName.trim(),
      email: user.email,
      phone: phone.trim(),
      city: (city || '').trim(),
      playerCount: playerCount || 1,
      paymentStatus: entryFee > 0 ? 'paid' : 'free',
      amountPaid: entryFee,
    });
    await tournament.save();

    res.json({ message: 'Registered successfully!', registrations: tournament.registrations.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/tournaments/:id/registrations — Organizer: view registrations
const getRegistrations = async (req, res) => {
  try {
    const tournament = await Tournament.findOne({ _id: req.params.id, organizer: req.user.id });
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    res.json(tournament.registrations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllTournaments, getTournamentById, getRegisteredTournaments, withdrawFromTournament, getMyTournaments, createTournament, updateTournament, deleteTournament, registerForTournament, getRegistrations };
