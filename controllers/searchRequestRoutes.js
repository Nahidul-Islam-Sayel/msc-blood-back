// routes/searchRequestRoutes.js
const express = require("express");
const SearchRequest = require("../models/SearchRequestModel");
const User = require("../models/UserModel");

const router = express.Router();

// Create new search request
router.post("/", async (req, res) => {
  try {
    const {
      browserId,
      patientInfo,
      filters,
      foundDonors,
      selectedDonors,
      status,
      searchDate,
    } = req.body;

    const searchRequest = new SearchRequest({
      browserId,
      patientInfo,
      filters,
      foundDonors,
      selectedDonors,
      status: status || "active",
      searchDate: searchDate || new Date(),
    });

    await searchRequest.save();

    res.status(201).json({
      status: "success",
      data: {
        searchRequest,
      },
    });
  } catch (error) {
    console.error("Error creating search request:", error);
    res.status(500).json({
      status: "error",
      message: "Error creating search request",
    });
  }
});

// Get latest search request (global latest)
router.get("/latest", async (req, res) => {
  try {
    const searchRequest = await SearchRequest.findOne()
      .sort({ searchDate: -1 })
      .populate("foundDonors selectedDonors");

    if (!searchRequest) {
      return res.status(404).json({
        status: "error",
        message: "No search request found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        searchRequest,
      },
    });
  } catch (error) {
    console.error("Error fetching latest search request:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching search request",
    });
  }
});

// Get latest search request for a specific browserId
router.get("/browser/:browserId/latest", async (req, res) => {
  try {
    const { browserId } = req.params;

    const searchRequest = await SearchRequest.findOne({ browserId })
      .sort({ searchDate: -1 })
      .populate("foundDonors selectedDonors");

    if (!searchRequest) {
      return res.status(404).json({
        status: "error",
        message: "No search request found for this browser",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        searchRequest,
      },
    });
  } catch (error) {
    console.error("Error fetching browser search request:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching search request",
    });
  }
});

// Update latest search request for browserId (selected donors, status, edits)
router.put("/browser/:browserId/latest", async (req, res) => {
  try {
    const { browserId } = req.params;
    const { selectedDonors, status, cancelledAt, patientInfo, filters, foundDonors } = req.body;

    let searchRequest = await SearchRequest.findOne({ browserId }).sort({ searchDate: -1 });

    if (!searchRequest) {
      // If not found, create one (helps when client sends update before create)
      searchRequest = new SearchRequest({
        browserId,
        patientInfo: patientInfo || {},
        filters: filters || {},
        foundDonors: foundDonors || [],
        selectedDonors: selectedDonors || [],
        status: status || "active",
        searchDate: new Date(),
      });
    } else {
      if (selectedDonors !== undefined) searchRequest.selectedDonors = selectedDonors;
      if (patientInfo) searchRequest.patientInfo = patientInfo;
      if (filters) searchRequest.filters = filters;
      if (foundDonors) searchRequest.foundDonors = foundDonors;
      if (status) searchRequest.status = status;
      if (cancelledAt) searchRequest.cancelledAt = cancelledAt;
      searchRequest.updatedAt = new Date();
    }

    await searchRequest.save();

    const populated = await SearchRequest.findById(searchRequest._id).populate("foundDonors selectedDonors");

    res.status(200).json({
      status: "success",
      data: {
        searchRequest: populated,
      },
    });
  } catch (error) {
    console.error("Error updating search request:", error);
    res.status(500).json({
      status: "error",
      message: "Error updating search request",
    });
  }
});

// Reset search request for this browser (clear patient & filters & found/selected donors)
router.delete("/browser/:browserId/reset", async (req, res) => {
  try {
    const { browserId } = req.params;

    const searchRequest = await SearchRequest.findOne({ browserId }).sort({ searchDate: -1 });

    if (!searchRequest) {
      // nothing to reset, respond success
      return res.status(200).json({
        status: "success",
        message: "No existing search request to reset",
      });
    }

    searchRequest.patientInfo = {
      patientName: "",
      bloodGroup: "",
      bloodBagsNeeded: 1,
    };
    searchRequest.filters = {
      bloodGroup: "",
      division: "",
      district: "",
      upazila: "",
      area: "",
    };
    searchRequest.foundDonors = [];
    searchRequest.selectedDonors = [];
    searchRequest.status = "reset";
    searchRequest.updatedAt = new Date();

    await searchRequest.save();

    res.status(200).json({
      status: "success",
      message: "Search request reset successfully",
      data: {
        searchRequest,
      },
    });
  } catch (error) {
    console.error("Error resetting search request:", error);
    res.status(500).json({
      status: "error",
      message: "Error resetting search request",
    });
  }
});

// Get all search requests (for admin)
router.get("/", async (req, res) => {
  try {
    const searchRequests = await SearchRequest.find().populate("foundDonors selectedDonors").sort({ searchDate: -1 });

    res.status(200).json({
      status: "success",
      results: searchRequests.length,
      data: {
        searchRequests,
      },
    });
  } catch (error) {
    console.error("Error fetching search requests:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching search requests",
    });
  }
});

module.exports = router;
