// controllers/donationController.js
const DonationRequest = require('../models/DonationRequestModel');
const User = require('../models/UserModel');
const AppError = require('../utils/appError');

exports.createRequest = async (req, res, next) => {
  try {
    const { donorId, requesterName, requesterPhone, patientInfo } = req.body;

    if (!donorId || !requesterName || !patientInfo) {
      return next(new AppError('Required fields missing', 400));
    }

    const donor = await User.findById(donorId);
    if (!donor) {
      return next(new AppError('Donor not found', 404));
    }

    const dr = await DonationRequest.create({
      donor: donorId,
      requesterName,
      requesterPhone,
      patientInfo
    });

    res.status(201).json({
      status: 'success',
      data: { request: dr }
    });
  } catch (error) {
    next(error);
  }
};

// Get requests assigned to logged in donor
exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = await DonationRequest.find({ donor: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: requests.length,
      data: { requests }
    });
  } catch (error) {
    next(error);
  }
};

// Accept a request (donor accepts)
exports.acceptRequest = async (req, res, next) => {
  try {
    const reqId = req.params.id;
    const donationReq = await DonationRequest.findById(reqId);
    if (!donationReq) return next(new AppError('Request not found', 404));

    if (donationReq.donor.toString() !== req.user.id) {
      return next(new AppError('Not authorized to accept this request', 403));
    }

    if (donationReq.status !== 'pending') {
      return next(new AppError('Request is not pending', 400));
    }

    donationReq.status = 'accepted';
    donationReq.acceptedAt = new Date();
    await donationReq.save();

    // update user: push to donationHistory, set wantToDonate false, set disabledUntil 90 days
    const user = await User.findById(req.user.id);

    const acceptedEntry = {
      requestId: donationReq._id,
      patientInfo: donationReq.patientInfo,
      acceptedAt: donationReq.acceptedAt
    };

    user.donationHistory = user.donationHistory || [];
    user.donationHistory.push(acceptedEntry);

    user.wantToDonate = false;
    const threeMonthsMs = 90 * 24 * 60 * 60 * 1000;
    user.disabledUntil = new Date(Date.now() + threeMonthsMs);

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      data: { request: donationReq, user }
    });
  } catch (error) {
    next(error);
  }
};

// Disable donation for logged-in user (manual)
exports.disableForDonating = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.wantToDonate = false;
    // optional custom disabledUntil via body.durationDays
    if (req.body.durationDays) {
      const ms = parseInt(req.body.durationDays, 10) * 24 * 60 * 60 * 1000;
      user.disabledUntil = new Date(Date.now() + ms);
    } else {
      user.disabledUntil = undefined; // no auto expiry if not provided
    }
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

// Enable donation (manual)
exports.enableForDonating = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.wantToDonate = true;
    user.disabledUntil = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

// Get donation history for logged-in user
exports.getHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      status: 'success',
      results: (user.donationHistory || []).length,
      data: { history: user.donationHistory || [] }
    });
  } catch (error) {
    next(error);
  }
};
